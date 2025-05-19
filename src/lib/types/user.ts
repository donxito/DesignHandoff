import { Database } from "./supabase";

export type DbUser = Database["public"]["Tables"]["profiles"]["Row"];

export interface User extends DbUser {
  // extended properties that might come from other sources
  projetcs_count?: number;
  role?: "designer" | "developer" | "admin";
  email?: string | null;
}

export type UserRole = "designer" | "developer" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
}
