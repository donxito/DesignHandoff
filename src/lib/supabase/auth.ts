import { supabase } from './client';

export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export const signUp = async ({ email, password, fullName }: SignUpData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  return { data, error };
};

export const signIn = async ({ email, password }: SignInData) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};