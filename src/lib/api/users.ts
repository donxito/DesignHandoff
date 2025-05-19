import { supabase } from "../supabase/client";
import { User } from "@/lib/types/user";

export const usersApi = {
  // * get current usr profile
  async getCurrentUser(): Promise<User | null> {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", sessionData.session.user.id)
      .single();

    if (error) {
      throw new Error(`Error fetching user profile: ${error.message}`);
    }

    return data;
  },

  // * Upadte the current user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      throw new Error("No authenticated user found");
    }

    const userId = sessionData.session.user.id;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }

    return data;
  },

  // * Get user by ID
  async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Error fetching user by ID: ${error.message}`);
    }

    return data;
  },
};
