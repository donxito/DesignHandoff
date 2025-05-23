import { Database } from "./supabase";
import { User } from "./user";

export type DbProject = Database["public"]["Tables"]["projects"]["Row"];

export type DbProjectMember =
  Database["public"]["Tables"]["project_members"]["Row"];

export interface Project extends DbProject {
  // extended properties for UI rendering
  members_count?: number;
  files_count?: number;
  thumbnail_url?: string | null;
}

export interface ProjectMember extends DbProjectMember {
  user?: User;
}

export interface ProjectWithMembers extends Project {
  members: ProjectMember[];
}

export interface CreateProjectData {
  name: string;
  description?: string | null;
  status?: ProjectStatus;
}

export interface UpdateProjectData {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
}

export type ProjectSortField =
  | "name"
  | "created_at"
  | "updated_at"
  | "files_count"
  | "members_count";

export type ProjectSortOrder = "asc" | "desc";

export const PROJECT_STATUS = ["active", "on_hold", "archived", "completed"] as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[number];

export const isProjectStatus = (status: string): status is ProjectStatus => 
  (PROJECT_STATUS as readonly string[]).includes(status);

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProjectQueryParams {
  filters?: ProjectFilters;
  sortField?: ProjectSortField;
  sortOrder?: ProjectSortOrder;
  page?: number;
  limit?: number;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
}
