// Auth-related types and interfaces

/**
 * Represents a user in the system.
 */
export type User = {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  role?: "designer" | "developer" | "admin";
};

/**
 * Zustand store state and actions for authentication.
 */
export type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
    role: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  getUser: () => Promise<void>;
};

/**
 * Props for the AuthForm component.
 */
export interface AuthFormProps {
  mode: "login" | "register";
} 