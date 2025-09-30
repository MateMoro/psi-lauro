import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Activity, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const { error: resetError } = await resetPassword(data.email);

      if (resetError) {
        if (resetError.message.includes('User not found')) {
          setError('Email não encontrado. Verifique se o email está correto.');
        } else if (resetError.message.includes('Email rate limit exceeded')) {
          setError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        } else {
          setError('Erro ao enviar email de recuperação. Tente novamente.');
        }
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl shadow-xl shadow-green-500/25">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Email Enviado!
            </CardTitle>
            <CardDescription className="text-slate-600">
              Verifique sua caixa de entrada
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  Enviamos um link para <span className="font-semibold">{getValues('email')}</span>
                </p>
                <p>
                  Clique no link no email para redefinir sua senha.
                  Se não encontrar o email, verifique a pasta de spam.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setSuccess(false)}
              variant="outline"
              className="w-full"
            >
              Tentar outro email
            </Button>

            <Button
              onClick={onBackToLogin}
              variant="ghost"
              className="w-full text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-700 rounded-2xl shadow-xl shadow-orange-500/25">
            <Activity className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Esqueci minha senha
          </CardTitle>
          <CardDescription className="text-slate-600">
            Digite seu email para receber um link de recuperação
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
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              disabled={isLoading}
              className="h-11 bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-500"
              autoComplete="email"
              autoFocus
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-medium shadow-lg shadow-orange-500/25 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar link de recuperação
                </>
              )}
            </Button>

            <Button
              onClick={onBackToLogin}
              variant="ghost"
              className="w-full text-slate-600 hover:text-slate-800"
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Login
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-center text-slate-500 leading-relaxed">
            Lembrou da senha?{' '}
            <button
              onClick={onBackToLogin}
              className="text-orange-600 hover:text-orange-800 underline underline-offset-2 transition-colors"
            >
              Faça login aqui
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}