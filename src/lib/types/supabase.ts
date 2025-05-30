// Re-export database types with proper naming for Supabase integration
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from "./database";

export type { Database, Tables, TablesInsert, TablesUpdate, Enums };

// Additional type aliases for convenience
export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Insert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Update<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Project-specific types
export type ProjectRow = Row<"projects">;
export type ProjectMemberRow = Row<"project_members">;
export type ProjectInvitationRow = Row<"project_invitations">;
export type ProfileRow = Row<"profiles">;

// Enum types
export type ProjectRole = Enums<"project_role">;
export type InvitationStatus = Enums<"invitation_status">;
