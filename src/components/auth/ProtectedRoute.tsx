import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePrivacyPolicy } from '@/hooks/usePrivacyPolicy';
import { canAccessPage } from '@/utils/permissions';
import type { UserRole } from '@/contexts/auth-context';
import { PrivacyPolicyModal } from '@/components/privacy/PrivacyPolicyModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresRole?: boolean;
  requiredRole?: UserRole;
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-48 mx-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UnauthorizedAccess({ userRole, path }: { userRole: string | null; path: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-destructive">
            <svg
              className="h-12 w-12 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Acesso Negado</h2>
          <p className="text-sm text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
          {userRole && (
            <p className="text-xs text-muted-foreground">
              Perfil atual: {userRole}
            </p>
          )}
          <div className="pt-2">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-primary hover:underline"
            >
              Voltar à página anterior
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProtectedRoute({ 
  children, 
  requiresAuth = true, 
  requiresRole = true,
  requiredRole
}: ProtectedRouteProps) {
  const { user, getUserRole, loading: authLoading, initializationError } = useAuth();
  const { 
    hasAcceptedCurrentVersion, 
    loading: privacyLoading, 
    needsToAcceptPolicy,
    acceptPolicy
  } = usePrivacyPolicy();
  const location = useLocation();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const userRole = getUserRole();
  const currentPath = location.pathname;

  console.log('🔒 ProtectedRoute: Check -', {
    path: currentPath,
    authLoading,
    privacyLoading,
    hasUser: !!user,
    userId: user?.id,
    userRole,
    requiresAuth,
    requiresRole,
    requiredRole,
    initializationError,
    timestamp: new Date().toISOString()
  });

  // Check if we need to show the privacy policy modal
  useEffect(() => {
    console.log('🔄 ProtectedRoute: Privacy check -', {
      authLoading,
      privacyLoading, 
      hasUser: !!user,
      needsPolicy: !authLoading && !privacyLoading ? needsToAcceptPolicy() : 'checking'
    });
    
    if (!authLoading && !privacyLoading && needsToAcceptPolicy()) {
      console.log('📋 ProtectedRoute: Setting privacy modal = true');
      setShowPrivacyModal(true);
    } else {
      console.log('📋 ProtectedRoute: Setting privacy modal = false');
      setShowPrivacyModal(false);
    }
  }, [authLoading, privacyLoading, hasAcceptedCurrentVersion, user, needsToAcceptPolicy]);

  // Handle privacy policy acceptance
  const handlePrivacyAccept = async () => {
    const result = await acceptPolicy();
    if (result.success) {
      setShowPrivacyModal(false);
    } else {
      console.error('Failed to accept privacy policy:', result.error);
      // Could show an error message to the user here
    }
  };

  // Show error only for critical authentication failures, not profile issues
  if (!authLoading && initializationError && !user) {
    console.error('❌ ProtectedRoute: SHOWING CRITICAL AUTH ERROR -', initializationError);
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-destructive">
              <svg
                className="h-12 w-12 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Erro de Autenticação</h2>
            <p className="text-sm text-muted-foreground">
              {initializationError}
            </p>
            <div className="pt-2 space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-primary hover:underline block w-full"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="text-sm text-muted-foreground hover:underline"
              >
                Ir para login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading screen while checking authentication and privacy
  if (authLoading || privacyLoading) {
    console.log('⏳ ProtectedRoute: SHOWING LOADING -', { authLoading, privacyLoading });
    return <LoadingScreen />;
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requiresAuth && !user) {
    console.log('🚪 ProtectedRoute: REDIRECTING TO LOGIN - no user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show privacy policy modal if user needs to accept it
  if (showPrivacyModal && user) {
    console.log('📋 ProtectedRoute: SHOWING PRIVACY MODAL');
    return (
      <PrivacyPolicyModal
        isOpen={true}
        onClose={() => {}} // Can't close without accepting
        onAccept={handlePrivacyAccept}
        mode="consent"
        isBlocking={true}
      />
    );
  }

  // Check role-based access if required
  if (requiresRole && user) {
    // If a specific role is required, check for that specific role
    if (requiredRole && userRole !== requiredRole) {
      console.log('❌ ProtectedRoute: UNAUTHORIZED - wrong role -', { userRole, requiredRole });
      return <UnauthorizedAccess userRole={userRole} path={currentPath} />;
    }
    // Otherwise, use the general page access check
    if (!requiredRole && !canAccessPage(userRole, currentPath)) {
      console.log('❌ ProtectedRoute: UNAUTHORIZED - no page access -', { userRole, currentPath });
      return <UnauthorizedAccess userRole={userRole} path={currentPath} />;
    }
  }

  // User is authenticated, has accepted privacy policy, and has permission
  console.log('✅ ProtectedRoute: ACCESS GRANTED - rendering children');
  return <>{children}</>;
}

// Convenience wrapper for pages that require authentication
export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiresAuth={true} requiresRole={false}>
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for pages that require both authentication and role check
export function RoleGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole?: UserRole }) {
  return (
    <ProtectedRoute requiresAuth={true} requiresRole={true} requiredRole={requiredRole}>
      {children}
    </ProtectedRoute>
  );
}