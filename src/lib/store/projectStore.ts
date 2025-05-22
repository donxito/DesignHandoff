import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import {
  Project,
  CreateProjectData,
  UpdateProjectData,
} from "@/lib/types/project";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (
    data: CreateProjectData
  ) => Promise<{ data?: Project; error?: Error }>;
  updateProject: (
    id: string,
    data: UpdateProjectData
  ) => Promise<{ data?: Project; error?: Error }>;
  deleteProject: (id: string) => Promise<{ error?: Error }>;
  setCurrentProject: (project: Project | null) => void;
  clearProjects: () => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  // * Fetch all projects for the current user
  fetchProjects: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(*)") // Join with profiles to get owner info
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({
        projects: data as Project[],
        loading: false,
      });
    } catch (error) {
      const err = error as Error;
      set({
        error: `Failed to fetch projects: ${err.message}`,
        loading: false,
      });
    }
  },

  // * Fetch a project by ID
  fetchProjectById: async (id) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      set({
        currentProject: data as Project,
        loading: false,
      });
    } catch (error) {
      const err = error as Error;
      set({
        error: `Failed to fetch project: ${err.message}`,
        loading: false,
      });
    }
  },

  // * Create a new project
  createProject: async (data) => {
    set({ loading: true, error: null });

    try {
      // Get current user ID from Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("You must be logged in to create a project");
      }

      const userId = sessionData.session.user.id;

      const { data: projectData, error } = await supabase
        .from("projects")
        .insert({
          name: data.name,
          description: data.description || null,
          owner_id: userId,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new project to the projects array
      set((state) => ({
        projects: [projectData as Project, ...state.projects],
        currentProject: projectData as Project,
        loading: false,
      }));

      return { data: projectData as Project };
    } catch (error) {
      const err = error as Error;
      set({
        error: `Failed to create project: ${err.message}`,
        loading: false,
      });
      return { error: err };
    }
  },

  // * Update a project
  updateProject: async (id, data) => {
    set({ loading: true, error: null });

    try {
      const { data: projectData, error } = await supabase
        .from("projects")
        .update({
          name: data.name,
          description: data.description,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update the project in the projects array
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id
            ? ({ ...project, ...projectData } as Project)
            : project
        ),
        currentProject:
          state.currentProject?.id === id
            ? ({ ...state.currentProject, ...projectData } as Project)
            : state.currentProject,
        loading: false,
      }));

      return { data: projectData as Project };
    } catch (error) {
      const err = error as Error;
      set({
        error: `Failed to update project: ${err.message}`,
        loading: false,
      });
      return { error: err };
    }
  },

  // * Delete a project
  deleteProject: async (id) => {
    set({ loading: true, error: null });

    try {
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
        // delete all comments related to those files
        const fileIds = designFiles.map((file) => file.id);

        const { error: commentsError } = await supabase
          .from("comments")
          .delete()
          .in("design_file_id", fileIds);

        if (commentsError) {
          console.error(
            `Failed to delete file comments: ${commentsError.message}`
          );
        }

        // delete the design files themselves
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
      const { error: projectDeleteError, count } = await supabase
        .from("projects")
        .delete({ count: "exact" })
        .eq("id", id);

      console.log("Delete project response:", {
        error: projectDeleteError,
        count,
      });

      if (projectDeleteError) {
        throw new Error(
          `Failed to delete project: ${projectDeleteError.message}`
        );
      }
      if (count === 0) {
        throw new Error(
          "Project was not deleted. You may not have permission (RLS) or project does not exist."
        );
      }

      //  Update the local state
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        currentProject:
          state.currentProject?.id === id ? null : state.currentProject,
        loading: false,
      }));

      return {};
    } catch (error) {
      const err = error as Error;
      set({
        error: `Failed to delete project: ${err.message}`,
        loading: false,
      });
      return { error: err };
    }
  },

  // Set current project
  setCurrentProject: (project) => set({ currentProject: project }),

  // Clear projects
  clearProjects: () => set({ projects: [], currentProject: null }),

  // Set error
  setError: (error) => set({ error }),
}));
