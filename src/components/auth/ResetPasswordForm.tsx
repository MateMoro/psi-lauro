import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Activity, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const { updatePassword, user, isPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Validate password recovery session
  useEffect(() => {
    console.log('[ResetPassword] Session check:', {
      hasUser: !!user,
      isPasswordRecovery,
      email: user?.email,
      url: window.location.href
    });

    // No user session at all - invalid or expired token
    if (!user) {
      console.warn('[ResetPassword] No user session found, redirecting to login');
      console.warn('[ResetPassword] Common causes:');
      console.warn('  1. Link expired (tokens expire after a certain time)');
      console.warn('  2. Link was generated for different environment (production vs localhost)');
      console.warn('  3. This URL is not in Supabase allowed redirect URLs list');
      console.warn('  4. Token already used');

      // Show helpful message depending on environment
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const message = isLocalhost
        ? 'Link de recuperação inválido ou expirado. Se você solicitou o link em produção, precisa solicitar um novo link aqui no localhost. Clique em "Esqueci minha senha" para gerar um novo link.'
        : 'Link de recuperação inválido ou expirado. Solicite um novo link.';

      navigate('/login', {
        replace: true,
        state: { message }
      });
      return;
    }

    // User is logged in normally (not a password recovery session)
    // Redirect to dashboard since they don't need to reset password
    if (user && !isPasswordRecovery) {
      console.log('[ResetPassword] User already logged in (not recovery), redirecting to dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }

    // Valid password recovery session
    console.log('[ResetPassword] Valid password recovery session for:', user.email);
  }, [user, isPasswordRecovery, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    console.log('[ResetPassword] Form submitted');

    if (!user) {
      console.error('[ResetPassword] No user session when submitting form');
      setError('Sessão inválida. Solicite um novo link de recuperação.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[ResetPassword] Calling updatePassword...');
      const { error: updateError } = await updatePassword(data.password);

      if (updateError) {
        console.error('[ResetPassword] Update failed:', updateError.message);
        if (updateError.message.includes('Password should be at least')) {
          setError('A senha deve ter pelo menos 6 caracteres.');
        } else if (updateError.message.includes('New password should be different')) {
          setError('A nova senha deve ser diferente da atual.');
        } else {
          setError('Erro ao atualizar senha. Tente novamente.');
        }
      } else {
        console.log('[ResetPassword] Password updated successfully!');
        setSuccess(true);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      }
    } catch (error) {
      console.error('[ResetPassword] Unexpected error:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex justify-center">
                <div className="p-3 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl shadow-xl shadow-green-500/25">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Senha Atualizada!
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Sua senha foi alterada com sucesso
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">
                      Senha alterada com sucesso!
                    </p>
                    <p>
                      Você será redirecionado para o dashboard em alguns segundos...
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/dashboard', { replace: true })}
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg shadow-green-500/25 transition-all duration-200"
              >
                Ir para Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl shadow-xl shadow-purple-500/25">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-800">
                Nova Senha
              </CardTitle>
              <CardDescription className="text-slate-600">
                Digite sua nova senha para continuar
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading}
                    className="h-11 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    disabled={isLoading}
                    className="h-11 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Atualizar Senha
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-center text-slate-500 leading-relaxed">
                Lembrou da senha?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors"
                >
                  Faça login aqui
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
                © 2025 – IntegraRAPS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}