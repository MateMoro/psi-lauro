import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { POLICY_VERSION } from '@/components/privacy/PrivacyPolicyModal';

interface PrivacyPolicyAcceptance {
  id: string;
  user_id: string;
  policy_version: string;
  accepted_at: string;
  ip_address?: string;
  user_agent?: string;
}

export function usePrivacyPolicy() {
  const { user } = useAuth();
  const [hasAcceptedCurrentVersion, setHasAcceptedCurrentVersion] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptance, setAcceptance] = useState<PrivacyPolicyAcceptance | null>(null);

  const checkPolicyAcceptance = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('privacy_policy_acceptances')
        .select('*')
        .eq('user_id', user.id)
        .eq('policy_version', POLICY_VERSION)
        .order('accepted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking policy acceptance:', error);
        setHasAcceptedCurrentVersion(false);
      } else {
        setHasAcceptedCurrentVersion(!!data);
        setAcceptance(data);
      }
    } catch (error) {
      console.error('Error checking policy acceptance:', error);
      setHasAcceptedCurrentVersion(false);
    } finally {
      setLoading(false);
    }
  };

  const acceptPolicy = async (): Promise<{ success: boolean; error?: Error }> => {
    if (!user) {
      return { success: false, error: new Error('User not authenticated') };
    }

    try {
      // Get user's IP and user agent for audit trail
      const userAgent = navigator.userAgent;
      
      // Note: Getting real IP address requires server-side implementation
      // For now, we'll use a placeholder or the user's reported IP
      const ipAddress = '0.0.0.0'; // Would be replaced with actual IP from server

      const { data, error } = await supabase
        .from('privacy_policy_acceptances')
        .insert({
          user_id: user.id,
          policy_version: POLICY_VERSION,
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording policy acceptance:', error);
        return { success: false, error: new Error(error.message) };
      }

      setHasAcceptedCurrentVersion(true);
      setAcceptance(data);
      return { success: true };
    } catch (error) {
      console.error('Error recording policy acceptance:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  };

  const getAllUserAcceptances = async (): Promise<PrivacyPolicyAcceptance[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('privacy_policy_acceptances')
        .select('*')
        .eq('user_id', user.id)
        .order('accepted_at', { ascending: false });

      if (error) {
        console.error('Error fetching user acceptances:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user acceptances:', error);
      return [];
    }
  };

  const needsToAcceptPolicy = (): boolean => {
    return user !== null && hasAcceptedCurrentVersion === false;
  };

  const canAccessApp = (): boolean => {
    if (!user) return false;
    return hasAcceptedCurrentVersion === true;
  };

  useEffect(() => {
    checkPolicyAcceptance();
  }, [user]);

  return {
    hasAcceptedCurrentVersion,
    loading,
    acceptance,
    acceptPolicy,
    getAllUserAcceptances,
    needsToAcceptPolicy,
    canAccessApp,
    refetch: checkPolicyAcceptance,
  };
}