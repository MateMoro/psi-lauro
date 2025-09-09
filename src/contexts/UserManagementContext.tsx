import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type UserProfile = {
  id: string;
  user_id: string;
  email: string;
  nome: string;
  role: 'coordenador' | 'gestor_caps';
  caps_id: string | null;
  hospital_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  caps?: { nome: string };
  hospitais?: { nome: string };
};

type CAPS = {
  id: string;
  nome: string;
  tipo: string | null;
  municipio: string | null;
};

type Hospital = {
  id: string;
  nome: string;
  cnes: string | null;
  municipio: string | null;
  tipo: string | null;
};

interface UserManagementContextType {
  users: UserProfile[];
  caps: CAPS[];
  hospitals: Hospital[];
  loading: boolean;
  refreshUsers: () => Promise<void>;
  refreshReferenceData: () => Promise<void>;
  refreshAll: () => Promise<void>;
  getUserById: (id: string) => UserProfile | undefined;
  getUsersByCAPS: (capsId: string) => UserProfile[];
  getUsersByHospital: (hospitalId: string) => UserProfile[];
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const UserManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [caps, setCaps] = useState<CAPS[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);

  // Load users data
  const refreshUsers = useCallback(async () => {
    if (userRole !== 'coordenador') return;
    
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          caps:caps_id(nome),
          hospitais:hospital_id(nome)
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, [userRole]);

  // Load reference data (CAPS and hospitals)
  const refreshReferenceData = useCallback(async () => {
    try {
      // Load CAPS
      const { data: capsData, error: capsError } = await supabase
        .from('caps')
        .select('*')
        .order('nome');

      if (capsError) throw capsError;
      setCaps(capsData || []);

      // Load Hospitals
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitais')
        .select('*')
        .order('nome');

      if (hospitalsError) throw hospitalsError;
      setHospitals(hospitalsData || []);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([refreshUsers(), refreshReferenceData()]);
    } finally {
      setLoading(false);
    }
  }, [refreshUsers, refreshReferenceData]);

  // Utility functions
  const getUserById = useCallback((id: string) => {
    return users.find(user => user.id === id);
  }, [users]);

  const getUsersByCAPS = useCallback((capsId: string) => {
    return users.filter(user => user.caps_id === capsId && user.ativo);
  }, [users]);

  const getUsersByHospital = useCallback((hospitalId: string) => {
    return users.filter(user => user.hospital_id === hospitalId && user.ativo);
  }, [users]);

  // Load data on mount and when role changes
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Set up real-time subscriptions for user_profiles changes
  useEffect(() => {
    if (userRole !== 'coordenador') return;

    const userProfilesSubscription = supabase
      .channel('user_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_profiles'
        },
        (payload) => {
          console.log('User profiles change detected:', payload);
          // Refresh users data when changes occur
          refreshUsers();
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(userProfilesSubscription);
    };
  }, [userRole, refreshUsers]);

  // Set up real-time subscriptions for CAPS and hospitals changes
  useEffect(() => {
    const capsSubscription = supabase
      .channel('caps_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'caps'
        },
        (payload) => {
          console.log('CAPS change detected:', payload);
          refreshReferenceData();
        }
      )
      .subscribe();

    const hospitalsSubscription = supabase
      .channel('hospitals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hospitais'
        },
        (payload) => {
          console.log('Hospitals change detected:', payload);
          refreshReferenceData();
        }
      )
      .subscribe();

    // Clean up subscriptions on unmount
    return () => {
      supabase.removeChannel(capsSubscription);
      supabase.removeChannel(hospitalsSubscription);
    };
  }, [refreshReferenceData]);

  const value: UserManagementContextType = {
    users,
    caps,
    hospitals,
    loading,
    refreshUsers,
    refreshReferenceData,
    refreshAll,
    getUserById,
    getUsersByCAPS,
    getUsersByHospital,
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};