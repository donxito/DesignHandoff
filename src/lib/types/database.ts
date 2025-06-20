export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          content: string;
          created_at: string;
          design_file_id: string | null;
          id: string;
          parent_id: string | null;
          updated_at: string;
          user_id: string | null;
          x: number | null;
          y: number | null;
        };
        Insert: {
          content: string;
          created_at?: string;
          design_file_id?: string | null;
          id?: string;
          parent_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
          x?: number | null;
          y?: number | null;
        };
        Update: {
          content?: string;
          created_at?: string;
          design_file_id?: string | null;
          id?: string;
          parent_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
          x?: number | null;
          y?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "comments_design_file_id_fkey";
            columns: ["design_file_id"];
            isOneToOne: false;
            referencedRelation: "design_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      design_files: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          file_url: string;
          id: string;
          name: string;
          project_id: string;
          thumbnail_url: string | null;
          updated_at: string | null;
          uploaded_by: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string | null;
          file_url: string;
          id?: string;
          name: string;
          project_id: string;
          thumbnail_url?: string | null;
          updated_at?: string | null;
          uploaded_by: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string | null;
          file_url?: string;
          id?: string;
          name?: string;
          project_id?: string;
          thumbnail_url?: string | null;
          updated_at?: string | null;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "design_files_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "file_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "design_files_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      exported_assets: {
        Row: {
          created_at: string | null;
          created_by: string;
          design_file_id: string;
          file_size: number;
          file_url: string;
          format: string;
          height: number;
          id: string;
          name: string;
          project_id: string;
          scale: number;
          width: number;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          design_file_id: string;
          file_size: number;
          file_url: string;
          format: string;
          height: number;
          id?: string;
          name: string;
          project_id: string;
          scale?: number;
          width: number;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          design_file_id?: string;
          file_size?: number;
          file_url?: string;
          format?: string;
          height?: number;
          id?: string;
          name?: string;
          project_id?: string;
          scale?: number;
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: "exported_assets_design_file_id_fkey";
            columns: ["design_file_id"];
            isOneToOne: false;
            referencedRelation: "design_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exported_assets_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      file_categories: {
        Row: {
          color: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          project_id: string;
          updated_at: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          project_id: string;
          updated_at?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          project_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "file_categories_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      project_invitations: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string | null;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          message: string | null;
          project_id: string;
          role: Database["public"]["Enums"]["project_role"];
          status: Database["public"]["Enums"]["invitation_status"] | null;
          token: string | null;
          updated_at: string | null;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string | null;
          email: string;
          expires_at: string;
          id?: string;
          invited_by: string;
          message?: string | null;
          project_id: string;
          role: Database["public"]["Enums"]["project_role"];
          status?: Database["public"]["Enums"]["invitation_status"] | null;
          token?: string | null;
          updated_at?: string | null;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string | null;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          message?: string | null;
          project_id?: string;
          role?: Database["public"]["Enums"]["project_role"];
          status?: Database["public"]["Enums"]["invitation_status"] | null;
          token?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_invitations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_members: {
        Row: {
          created_at: string | null;
          id: string;
          invited_by: string | null;
          joined_at: string | null;
          project_id: string;
          role: Database["public"]["Enums"]["project_role"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          invited_by?: string | null;
          joined_at?: string | null;
          project_id: string;
          role: Database["public"]["Enums"]["project_role"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          invited_by?: string | null;
          joined_at?: string | null;
          project_id?: string;
          role?: Database["public"]["Enums"]["project_role"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_invited_by";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string | null;
          created_by: string;
          description: string | null;
          id: string;
          name: string;
          owner_id: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          description?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          description?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      change_user_password: {
        Args: { current_password: string; new_password: string };
        Returns: Json;
      };
      cleanup_old_exported_assets: {
        Args: { days_old?: number };
        Returns: number;
      };
      delete_user_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_project_asset_stats: {
        Args: { project_uuid: string };
        Returns: {
          total_assets: number;
          total_size: number;
          formats: Json;
          recent_exports: number;
        }[];
      };
      get_user_project_role: {
        Args: { user_id: string; project_id: string };
        Returns: string;
      };
      update_user_email: {
        Args: { new_email: string };
        Returns: Json;
      };
    };
    Enums: {
      invitation_status: "pending" | "accepted" | "declined" | "expired";
      project_role: "owner" | "admin" | "member" | "viewer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      invitation_status: ["pending", "accepted", "declined", "expired"],
      project_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const;
