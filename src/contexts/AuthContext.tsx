import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, AuthContextType, UserProfile, UserRole } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 AuthContext: Starting fetchUserProfile for:', userId);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ AuthContext: Error fetching user profile:', profileError);
        console.error('Profile error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        setProfile(null);
        throw new Error(`Profile fetch failed: ${profileError.message}`);
      }

      // Se não existe perfil, criar um perfil básico
      if (!profileData) {
        console.log('⚠️ AuthContext: No profile found for user, would need to create one');
        setProfile(null);
        return;
      }

      console.log('✅ AuthContext: Profile loaded successfully:', {
        id: profileData.id,
        user_id: profileData.user_id,
        role: profileData.role,
        hospital: profileData.hospital_name
      });
      setProfile(profileData);
    } catch (error) {
      console.error('💥 AuthContext: Exception in fetchUserProfile:', error);
      setProfile(null);
      throw error; // Re-throw so calling code can handle it
    }
  };

  const getUserRole = (): UserRole | null => {
    // Primeira tentativa: buscar do JWT claims se disponível
    if (user?.user_metadata?.user_role) {
      const jwtRole = user.user_metadata.user_role;
      if (jwtRole === 'coordenador' || jwtRole === 'gestor_caps') {
        return jwtRole as UserRole;
      }
    }

    // Segunda tentativa: buscar do profile da base de dados
    if (!profile?.role) return null;
    
    const role = profile.role;
    
    switch (role) {
      case 'coordenador':
      case 'gestor_caps':
        return role as UserRole;
      default:
        // Para compatibilidade, mapear outros roles possíveis
        return 'gestor_caps'; // default fallback
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role || false;
  };

  const canAccessPage = (page: string): boolean => {
    const role = getUserRole();
    
    if (!role) return false;
    
    // Coordenador has access to everything
    if (role === 'coordenador') return true;
    
    // Pages restricted only to coordenador (like settings)
    const coordenadorOnlyPages = ['settings', 'configuracoes'];
    if (coordenadorOnlyPages.includes(page.toLowerCase())) {
      return role === 'coordenador';
    }
    
    // All other pages are accessible to gestor_caps and equipe_multiprofissional
    return true;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    console.log('🔄 AuthContext: Starting signOut...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ AuthContext: Supabase signOut error:', error);
        throw error;
      }
      console.log('✅ AuthContext: Supabase signOut successful');
      
      // Clear state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Clear localStorage
      localStorage.removeItem('psi-selected-hospital');
      
      console.log('🧹 AuthContext: State cleared, ready for redirect');
    } catch (error) {
      console.error('💥 AuthContext: SignOut exception:', error);
      throw error;
    }
  };

  const getJWTClaims = () => {
    if (!session?.access_token) return null;
    
    try {
      // Decodificar JWT token (sem verificar assinatura - apenas para debug)
      const base64Url = session.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const debugAuthState = () => {
    console.group('🔍 DEBUG: Auth State');
    console.log('User:', user);
    console.log('Profile:', profile);
    console.log('Session:', session);
    console.log('JWT Claims:', getJWTClaims());
    console.log('Current Role (from function):', getUserRole());
    console.groupEnd();
  };

  useEffect(() => {
    console.log('🔄 AuthContext: Initializing auth...');
    setInitializationError(null);
    let isInitialLoad = true;
    
    // Increase timeout to 30 seconds for better reliability
    const initTimeout = setTimeout(() => {
      if (isInitialLoad) {
        console.warn('⏰ AuthContext: Initialization timeout after 30 seconds');
        setInitializationError('Authentication initialization timed out');
        setLoading(false);
      }
    }, 30000);
    
    // Listen for auth changes first to avoid race conditions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthContext: Auth state change -', event, session ? 'SESSION_EXISTS' : 'NO_SESSION');
      
      // Clear initialization timeout once we have any auth event
      if (isInitialLoad) {
        clearTimeout(initTimeout);
        isInitialLoad = false;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 AuthContext: Fetching profile after auth change:', session.user.id);
        try {
          await fetchUserProfile(session.user.id);
          console.log('✅ AuthContext: Profile fetch completed');
        } catch (error) {
          console.error('❌ AuthContext: Profile fetch failed, but continuing with session:', error);
          // Don't set initialization error - we have a valid session even without profile
          setProfile(null);
        }
      } else {
        console.log('❌ AuthContext: Clearing profile (no session)');
        setProfile(null);
      }
      
      console.log('✅ AuthContext: Auth state change complete');
      setLoading(false);
    });
    
    // Get initial session after setting up listener
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('📊 AuthContext: Initial session check:', session ? 'EXISTS' : 'NULL');
      
      if (error) {
        console.error('❌ AuthContext: Error getting initial session:', error);
        // Only set error if we don't already have a session from onAuthStateChange
        if (isInitialLoad) {
          clearTimeout(initTimeout);
          setInitializationError(`Session error: ${error.message}`);
          setLoading(false);
          isInitialLoad = false;
        }
        return;
      }
      
      // If we already processed this session via onAuthStateChange, skip
      if (!isInitialLoad) {
        console.log('📊 AuthContext: Session already processed via onAuthStateChange');
        return;
      }
      
      // Clear timeout since we got a response
      clearTimeout(initTimeout);
      isInitialLoad = false;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 AuthContext: Fetching profile for initial session:', session.user.id);
        try {
          await fetchUserProfile(session.user.id);
          console.log('✅ AuthContext: Initial profile fetch completed');
        } catch (error) {
          console.error('❌ AuthContext: Initial profile fetch failed, but continuing with session:', error);
          // Don't set initialization error - we have a valid session even without profile
          setProfile(null);
        }
      }
      
      console.log('✅ AuthContext: Initial loading complete');
      setLoading(false);
    }).catch(error => {
      console.error('💥 AuthContext: Exception during session initialization:', error);
      if (isInitialLoad) {
        clearTimeout(initTimeout);
        setInitializationError(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        setLoading(false);
        isInitialLoad = false;
      }
    });

    return () => {
      console.log('🧹 AuthContext: Cleaning up subscription');
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    initializationError,
    signIn,
    signOut,
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

