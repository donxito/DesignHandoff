export type User = {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  role?: "designer" | "developer" | "admin";
};


export type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
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

