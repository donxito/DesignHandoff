import { supabase } from "@/lib/supabase/client";
import {
  CreateProjectData,
  Project,
  UpdateProjectData,
} from "../types/project";

export const projectsApi = {
  // * Get all projects for a user
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select(`*, project_members(count), design_files(count)`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failded to fetch `);
    }

    // transform the data to include count as properties
    return (data || []).map((project) => ({
      ...project,
      members_count: project.project_members?.[0]?.count || 0,
      files_count: project.design_files?.[0]?.count || 0,
    }));
  },

  // * Get a single project by ID
  async getProjectById(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .select(`*, project_members(count), design_files(count)`)
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    // transform the data to include count as properties
    return {
      ...data,
      members_count: data.project_members?.[0]?.count || 0,
      files_count: data.design_files?.[0]?.count || 0,
    };
  },

  // * Create a new project
  async createProject(projectData: CreateProjectData): Promise<Project> {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      throw new Error(`Unauthorized: User not authenticated`);
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: projectData.name,
        owner_id: sessionData.session.user.id,
        description: projectData.description || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  },

  // * Update a project
  async updateProject(
    id: string,
    projectData: UpdateProjectData
  ): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .update({
        name: projectData.name,
        description: projectData.description,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return data;
  },

  // * Delete a project
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  },
};
