'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { signIn, signUp, signOut, SignInData, SignUpData } from '@/lib/supabase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const login = async (credentials: SignInData) => {
    setLoading(true);
    const { data, error } = await signIn(credentials);
    setLoading(false);
    return { data, error };
  };

  const register = async (credentials: SignUpData) => {
    setLoading(true);
    const { data, error } = await signUp(credentials);
    setLoading(false);
    return { data, error };
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await signOut();
    setLoading(false);
    return { error };
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};