import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Loader2 } from 'lucide-react';

export default function SignUp() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
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

  // Redirect to dashboard if already logged in
  if (user && !loading) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <SignUpForm onBackToLogin={() => window.location.href = '/login'} />

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
                © 2025 – IntegraRAPS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}