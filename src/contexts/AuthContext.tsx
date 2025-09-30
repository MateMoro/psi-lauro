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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

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
    const redirectUrl = `${window.location.origin}/reset-password`;

    console.log('[Auth] Sending password reset email to:', email);
    console.log('[Auth] Redirect URL:', redirectUrl);
    console.log('[Auth] IMPORTANT: Make sure this URL is added to Supabase allowed redirect URLs');
    console.log('[Auth] Go to: Supabase Dashboard > Authentication > URL Configuration > Redirect URLs');
    console.log('[Auth] Add both production and localhost URLs:');
    console.log('[Auth]   - https://integra-raps.vercel.app/reset-password');
    console.log('[Auth]   - http://localhost:8080/reset-password');
    console.log('[Auth]   - http://localhost:8081/reset-password (or whatever port Vite uses)');

    // IMPORTANT: The redirectTo URL MUST be in the Supabase allowed redirect URLs list
    // Otherwise Supabase will reject the redirect and the password reset will fail
    // The link generated will only work on the same origin where it was requested
    // (e.g., link generated on localhost only works on localhost, not on production)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error('[Auth] Password reset error:', error);
    } else {
      console.log('[Auth] Password reset email sent successfully');
      console.log('[Auth] User will receive an email with a link to:', redirectUrl);
    }

    return { error };
  };

  const updatePassword = async (password: string) => {
    console.log('[Auth] Updating password for user:', user?.email);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error('[Auth] Update password error:', error);
    } else {
      console.log('[Auth] Password updated successfully');
    }

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
    // Get initial session and check if it's a password recovery session
    // IMPORTANT: When user clicks password reset link from email, Supabase redirects
    // to the app with hash fragments like #access_token=xxx&type=recovery
    // The detectSessionInUrl setting automatically processes these fragments

    console.log('='.repeat(80));
    console.log('[AuthContext] 🔍 DEBUGGING PASSWORD RECOVERY FLOW');
    console.log('='.repeat(80));

    // Log URL details
    const urlHash = window.location.hash;
    const fullUrl = window.location.href;
    const searchParams = new URLSearchParams(window.location.search);
    const urlError = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    const hasAccessToken = urlHash.includes('access_token');
    const hasTypeRecovery = urlHash.includes('type=recovery') || urlHash.includes('type%3Drecovery');

    console.log('[AuthContext] 📍 URL Information:');
    console.log('  Full URL:', fullUrl);
    console.log('  Hash present:', urlHash.length > 0);
    console.log('  Hash length:', urlHash.length);
    console.log('  Hash content (first 100 chars):', urlHash.substring(0, 100));
    console.log('  Has access_token:', hasAccessToken);
    console.log('  Has type=recovery:', hasTypeRecovery);
    console.log('');

    // Check for Supabase error codes in URL
    if (urlError || errorCode) {
      console.error('[AuthContext] ⛔ SUPABASE ERROR DETECTED IN URL!');
      console.error('  Error:', urlError);
      console.error('  Error Code:', errorCode);
      console.error('  Description:', errorDescription);
      console.error('');

      if (errorCode === 'otp_expired') {
        console.error('[AuthContext] 💥 TOKEN EXPIRED!');
        console.error('  Recovery tokens expire quickly (usually 1 hour)');
        console.error('  This token is no longer valid');
        console.error('');
        console.error('[AuthContext] 🔧 SOLUTION:');
        console.error('  1. Go to http://localhost:8081/forgot-password');
        console.error('  2. Generate a NEW recovery link');
        console.error('  3. Use the link IMMEDIATELY (do not wait)');
        console.error('  4. Complete the password reset within a few minutes');
      }
      console.log('');
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[AuthContext] 📦 Session Check Result:');
      console.log('  Has session:', !!session);
      console.log('  Has user:', !!session?.user);
      console.log('  User email:', session?.user?.email || 'N/A');
      console.log('  Error:', error?.message || 'None');
      console.log('');

      // Check if this is a password recovery session by looking at URL hash
      const isRecoveryInUrl = hasTypeRecovery;

      if (isRecoveryInUrl) {
        console.log('[AuthContext] ✅ PASSWORD_RECOVERY detected in URL!');
        if (session?.user) {
          console.log('[AuthContext] ✅ Valid session found for recovery');
          console.log('[AuthContext] ✅ User will be shown password reset form');
          setIsPasswordRecovery(true);
        } else {
          console.warn('[AuthContext] ⚠️ Recovery URL detected but NO SESSION!');
          console.warn('[AuthContext] Possible causes:');
          console.warn('  1. Token expired');
          console.warn('  2. Token already used');
          console.warn('  3. Redirect URL not in Supabase allowed list');
          console.warn('  4. Link generated before adding localhost to allowed URLs');
          console.warn('');
          console.warn('[AuthContext] 🔧 Solution:');
          console.warn('  → Generate a NEW link from http://localhost:8081/forgot-password');
          console.warn('  → Make sure http://localhost:8081/reset-password is in Supabase Redirect URLs');
        }
      } else {
        console.log('[AuthContext] ℹ️ Not a recovery URL (normal session check)');
      }

      console.log('='.repeat(80));
      console.log('');

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Only fetch profile if NOT in password recovery mode
      if (session?.user && !isRecoveryInUrl) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth event:', event, 'User:', session?.user?.email);

        // Handle password recovery flow
        if (event === 'PASSWORD_RECOVERY') {
          console.log('[AuthContext] PASSWORD_RECOVERY detected - user should reset password');
          setIsPasswordRecovery(true);
          setSession(session);
          setUser(session?.user ?? null);
          // Don't fetch profile during password recovery - we want to force password change first
          return;
        }

        // For other events, clear recovery flag and proceed normally
        setIsPasswordRecovery(false);
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
    isPasswordRecovery,
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