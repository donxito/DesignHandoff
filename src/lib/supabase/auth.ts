import { supabase } from "./client";

export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export type Provider = "google" | "github";

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

// social login
export const signInWithProvider = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
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

// reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { data, error };
};

// update password
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

// update email with verification
export const updateEmail = async (newEmail: string) => {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });
  return { data, error };
};

// change password with current password verification
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  // verify current password by attempting to sign in
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user?.email) {
    return { error: new Error("User not found") };
  }

  // verify current password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: sessionData.session.user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { error: { message: "Invalid current password" } };
  }

  // update to new password
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
};

// delete user account
export const deleteAccount = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user?.email) {
    return { error: new Error("User not found") };
  }

  const { error } = await supabase.rpc("delete_user_account");
  return { error };
};
