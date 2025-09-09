import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Activity, Eye, EyeOff } from 'lucide-react';
import { PrivacyPolicyModal } from '@/components/privacy/PrivacyPolicyModal';

export default function Login() {
  const { user, signIn, loading, debugAuthState } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Fallback redirect effect for login attempts that succeed but don't trigger immediate redirect
  useEffect(() => {
    if (loginAttempted && !loading && !isLoading) {
      const checkForSuccessfulLogin = setTimeout(async () => {
        try {
          // Check if we have a valid session using Supabase API
          const { data: { session }, error } = await supabase.auth.getSession();
          if (!error && session?.user) {
            console.log('🔄 Login: Forcing redirect after successful login - session found:', session.user.id);
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
          } else {
            console.log('🔄 Login: No valid session found during fallback check');
          }
        } catch (error) {
          console.error('🔄 Login: Error checking session during fallback:', error);
        }
      }, 2000); // Wait 2 seconds for auth state to update

      return () => clearTimeout(checkForSuccessfulLogin);
    }
  }, [loginAttempted, loading, isLoading, location, navigate]);

  // Redirect to dashboard if already logged in
  if (user && !loading) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login.');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
      } else {
        // Login successful, set flag for fallback redirect
        setLoginAttempted(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPrivacy = () => {
    setShowPrivacyModal(true);
  };

  const handleClosePrivacy = () => {
    setShowPrivacyModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex justify-center">
                <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  IntegraRAPS
                </CardTitle>
                <CardDescription className="text-slate-600">
                  IntegraRAPS - Ferramenta de Apoio à Rede de Atenção Psicossocial
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      autoComplete="current-password"
                      required
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
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                {user && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={debugAuthState}
                    className="w-full text-xs"
                  >
                    🔍 Debug Auth State (Dev Only)
                  </Button>
                )}
                <p className="text-xs text-center text-slate-500 leading-relaxed">
                  Ao fazer login, você concorda com nossa{' '}
                  <button
                    onClick={handleShowPrivacy}
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                  >
                    Política de Privacidade
                  </button>
                  .
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

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={handleClosePrivacy}
        mode="read"
        isBlocking={false}
      />
    </>
  );
}