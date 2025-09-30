import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, AuthContextType, UserProfile, UserRole, JWTClaims } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getUserRole = (): UserRole | null => {
    if (user?.user_metadata?.user_role) {
      const jwtRole = user.user_metadata.user_role;
      if (jwtRole === 'coordenador' || jwtRole === 'gestor_caps') {
        return jwtRole as UserRole;
      }
    }

    if (!profile?.role) return null;

    const role = profile.role;

    switch (role) {
      case 'coordenador':
      case 'gestor_caps':
        return role as UserRole;
      default:
        return 'gestor_caps';
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role || false;
  };

  const canAccessPage = (page: string): boolean => {
    const role = getUserRole();

    if (!role) return false;

    if (role === 'coordenador') return true;

    const coordenadorOnlyPages = ['settings', 'configuracoes'];
    if (coordenadorOnlyPages.includes(page.toLowerCase())) {
      return role === 'coordenador';
    }

    return true;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData?: { name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {},
        emailRedirectTo: undefined, // No email confirmation needed
      }
    });

    // If signup successful and email confirmation disabled, user is auto-confirmed
    // Session will be automatically set by onAuthStateChange listener
    return { data, error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('psi-selected-hospital');
  };

  const getJWTClaims = (): JWTClaims | null => {
    if (!session?.access_token) return null;

    try {
      const base64Url = session.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload) as JWTClaims;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const debugAuthState = () => {
    console.group('Auth State');
    console.log('User:', user);
    console.log('Profile:', profile);
    console.log('Session:', session);
    console.log('JWT Claims:', getJWTClaims());
    console.log('Current Role:', getUserRole());
    console.groupEnd();
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    initializationError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    getUserRole,
    hasRole,
    canAccessPage,
    getJWTClaims,
    debugAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}