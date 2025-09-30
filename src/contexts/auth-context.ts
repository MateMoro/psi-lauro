import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

export type UserRole = 'coordenador' | 'gestor_caps';

export type UserProfile = Tables<'user_profiles'>;

export interface JWTClaims {
  aud?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  sub?: string;
  email?: string;
  phone?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  role?: string;
  [key: string]: unknown;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initializationError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData?: { name?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  getUserRole: () => UserRole | null;
  hasRole: (role: UserRole) => boolean;
  canAccessPage: (page: string) => boolean;
  getJWTClaims: () => JWTClaims | null;
  debugAuthState: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);