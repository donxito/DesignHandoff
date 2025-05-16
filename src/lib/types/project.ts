import { Database } from './supabase';
import { User } from './user';


export type DbProject = Database['public']['Tables']['projects']['Row'];

export type DbProjectMember = Database['public']['Tables']['project_members']['Row'];

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
}

export interface UpdateProjectData {
    name?: string;
    description?: string | null;
}
    

    
