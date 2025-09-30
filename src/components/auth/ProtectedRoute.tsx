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
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Carregando...</h2>
          <p className="text-sm text-muted-foreground">Verificando autenticação</p>
        </div>
      </div>
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
  const { user, getUserRole, profile, loading: authLoading } = useAuth();
  const {
    hasAcceptedCurrentVersion,
    loading: privacyLoading,
    needsToAcceptPolicy,
    acceptPolicy
  } = usePrivacyPolicy();
  const location = useLocation();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isWaitingForProfile, setIsWaitingForProfile] = useState(false);

  const userRole = getUserRole();
  const currentPath = location.pathname;

  // Add intelligent delay when user exists but profile hasn't loaded yet
  useEffect(() => {
    if (!authLoading && user && !profile) {
      setIsWaitingForProfile(true);
      const timer = setTimeout(() => {
        setIsWaitingForProfile(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsWaitingForProfile(false);
    }
  }, [authLoading, user, profile]);

  // Check if we need to show the privacy policy modal
  useEffect(() => {
    if (!authLoading && !privacyLoading && needsToAcceptPolicy()) {
      setShowPrivacyModal(true);
    } else {
      setShowPrivacyModal(false);
    }
  }, [authLoading, privacyLoading, hasAcceptedCurrentVersion, user, needsToAcceptPolicy]);

  // Handle privacy policy acceptance
  const handlePrivacyAccept = async () => {
    const result = await acceptPolicy();
    if (result.success) {
      setShowPrivacyModal(false);
    }
  };

  // Show loading screen while checking authentication, privacy, or waiting for profile
  if (authLoading || privacyLoading || isWaitingForProfile) {
    return <LoadingScreen />;
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requiresAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show privacy policy modal if user needs to accept it
  if (showPrivacyModal && user) {
    return (
      <PrivacyPolicyModal
        isOpen={true}
        onClose={() => {}}
        onAccept={handlePrivacyAccept}
        mode="consent"
        isBlocking={true}
      />
    );
  }

  // Check role-based access if required
  if (requiresRole && user) {
    if (requiredRole && userRole !== requiredRole) {
      return <UnauthorizedAccess userRole={userRole} path={currentPath} />;
    }
    if (!requiredRole && !canAccessPage(userRole, currentPath)) {
      return <UnauthorizedAccess userRole={userRole} path={currentPath} />;
    }
  }

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