import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

export type UserRole = 'coordenador' | 'gestor_caps';

export type UserProfile = Tables<'user_profiles'>;

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initializationError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getUserRole: () => UserRole | null;
  hasRole: (role: UserRole) => boolean;
  canAccessPage: (page: string) => boolean;
  getJWTClaims: () => any;
  debugAuthState: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);