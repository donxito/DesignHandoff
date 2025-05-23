import { supabase } from "@/lib/supabase/client";
import {
  CreateProjectData,
  Project,
  UpdateProjectData,
  ProjectQueryParams,
  ProjectsResponse,
} from "@/lib/types/project";

export const projectsApi = {
  // * Get all projects for a user with filtering and sorting
  async getProjects(
    params: ProjectQueryParams = {}
  ): Promise<ProjectsResponse> {
    const {
      filters = {},
      sortField = "created_at",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = params;

    let query = supabase
      .from("projects")
      .select(`*, project_members(count), design_files(count)`, {
        count: "exact",
      });

    // Apply search filter
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Apply status filter
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    // Apply date filters
    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    // Apply sorting
    query = query.order(sortField, { ascending: sortOrder === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    // include count as properties
    const projects = (data || []).map((project) => ({
      ...project,
      members_count: project.project_members?.[0]?.count || 0,
      files_count: project.design_files?.[0]?.count || 0,
    }));

    return {
      projects,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
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

    // include count as properties
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

    const userId = sessionData.session.user.id;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: projectData.name,
        owner_id: userId,
        created_by: userId,
        description: projectData.description || null,
        status: projectData.status || "active", // default
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
    const updateData: Partial<UpdateProjectData> = {};

    // Only include fields that are provided
    if (projectData.name !== undefined) updateData.name = projectData.name;
    if (projectData.description !== undefined)
      updateData.description = projectData.description;
    if (projectData.status !== undefined)
      updateData.status = projectData.status;

    const { data, error } = await supabase
      .from("projects")
      .update(updateData)
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
    try {
      console.log("API: Deleting project with ID:", id);

      // delete all related project_members
      const { error: membersError } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", id);

      if (membersError) {
        console.error(
          `Failed to delete project members: ${membersError.message}`
        );
      }

      // get all design files related to this project
      const { data: designFiles, error: filesQueryError } = await supabase
        .from("design_files")
        .select("id")
        .eq("project_id", id);

      if (filesQueryError) {
        console.error(
          `Failed to query design files: ${filesQueryError.message}`
        );
      } else if (designFiles && designFiles.length > 0) {
        // If there are design files, delete all comments related to those files
        const fileIds = designFiles.map((file) => file.id);

        // Delete comments related to the design files
        const { error: commentsError } = await supabase
          .from("comments")
          .delete()
          .in("design_file_id", fileIds);

        if (commentsError) {
          console.error(
            `Failed to delete file comments: ${commentsError.message}`
          );
        }

        // Delete the design files themselves
        const { error: filesDeleteError } = await supabase
          .from("design_files")
          .delete()
          .eq("project_id", id);

        if (filesDeleteError) {
          console.error(
            `Failed to delete design files: ${filesDeleteError.message}`
          );
        }
      }

      // delete the project itself
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) {
        throw new Error(`Failed to delete project: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in deleteProject:", error);
      throw error;
    }
  },
};
