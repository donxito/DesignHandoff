"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
//import type { Database } from "@/types/database.types";
import type { Project, CreateProjectPayload } from "@/types/project";
import { getErrorMessage } from "@/lib/getErrorMessage";

// Project store state type
type ProjectState = {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (project: CreateProjectPayload) => Promise<Project | null>;
  getProject: (id: string) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<CreateProjectPayload>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
};

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  
  // Fetch all projects for the authenticated user
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    
    try {
      // Get all projects where the user is a member
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ 
        projects: data as Project[], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching projects:', getErrorMessage(error));
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },
  
  // Create a new project
  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Debug logging: log user object
      console.log('[createProject] User:', user);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Prepare insert payload
      const insertPayload = {
        name: projectData.name,
        description: projectData.description || null,
        thumbnail_url: projectData.thumbnail_url || null,
        created_by: user.id,
      };
      // Debug logging: log insert payload
      console.log('[createProject] Insert payload:', insertPayload);
      
      // Insert new project
      const { data, error } = await supabase
        .from('projects')
        .insert(insertPayload)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add current user as project owner
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'owner',
        });
      
      if (memberError) throw memberError;
      
      // Update local state
      const newProject = data as Project;
      set(state => ({ 
        projects: [newProject, ...state.projects],
        currentProject: newProject,
        isLoading: false 
      }));
      
      return newProject;
    } catch (error) {
      // Debug logging: log full error object
      console.error('[createProject] Error object:', error);
      console.error('Error creating project:', getErrorMessage(error));
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Get a single project by ID
  getProject: async (id) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const project = data as Project;
      set({ 
        currentProject: project,
        isLoading: false 
      });
      
      return project;
    } catch (error) {
      console.error('Error fetching project:', getErrorMessage(error));
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Update a project
  updateProject: async (id, updates) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedProject = data as Project;
      
      // Update the projects array and current project
      set(state => ({
        projects: state.projects.map(project => 
          project.id === id ? updatedProject : project
        ),
        currentProject: updatedProject,
        isLoading: false
      }));
      
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', getErrorMessage(error));
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Delete a project
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state to remove the deleted project
      set(state => ({
        projects: state.projects.filter(project => project.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', getErrorMessage(error));
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      return false;
    }
  },
}));