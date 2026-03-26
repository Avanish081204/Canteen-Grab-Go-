import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'user' | 'staff' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('local_admin') === 'true') {
          if (mounted) {
            setProfile({
              id: 'local-admin',
              full_name: 'Avanish',
              role: 'admin',
              updated_at: new Date().toISOString()
            });
            setLoading(false);
          }
          return;
        }

        if (sessionStorage.getItem('local_staff') === 'true') {
          if (mounted) {
            setProfile({
              id: 'local-staff',
              full_name: 'Avanish Staff',
              role: 'staff',
              updated_at: new Date().toISOString()
            });
            setLoading(false);
          }
          return;
        }
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await (supabase
          .from('profiles' as any)
          .select('*')
          .eq('id', session.user.id)
          .single() as any);

        const userEmail = session.user.email?.toLowerCase();
        const adminEmails = [
          'avanishshukla234@gmail.com'
        ];
        const isAdminEmail = userEmail && adminEmails.includes(userEmail);

        if (error && !isAdminEmail) {
          console.error('Error fetching profile:', error);
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          const fetchedProfile = data ? (data as Profile) : ({ id: session.user.id, full_name: session.user.user_metadata?.full_name || 'Admin', role: 'user', updated_at: new Date().toISOString() } as Profile);
          
          if (isAdminEmail) {
            setProfile({ ...fetchedProfile, role: 'admin' });
          } else {
            setProfile(fetchedProfile);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (typeof window !== 'undefined' && (sessionStorage.getItem('local_admin') === 'true' || sessionStorage.getItem('local_staff') === 'true')) {
        fetchProfile();
        return;
      }
      if (!session) {
        setProfile(null);
        setLoading(false);
      } else {
        fetchProfile();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { profile, loading, role: profile?.role || 'user' };
}
