"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/use-project-query";
import { Project } from "@/lib/types/project";

type ProjectSelectorProps = {
  onSelect: (project: Project) => void;
  selectedId?: string;
  label?: string;
};

export function ProjectSelector({
  onSelect,
  selectedId,
  label = "Select Project",
}: ProjectSelectorProps) {
  const { data: projects, isLoading, error } = useProjects();
  const [isOpen, setIsOpen] = useState(false);

  // * Find the selected project
  const selectedProject = projects?.find((p) => p.id === selectedId);

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
        {label}
      </label>

      <button
        type="button"
        className={`px-4 py-2.5 w-full rounded-md bg-white dark:bg-gray-800 border-3 
          transition-all duration-200 border-black dark:border-white 
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]
          text-left flex justify-between items-center ${isLoading ? "opacity-50 cursor-wait" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <span>
          {selectedProject ? selectedProject.name : "Select a project"}
        </span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-3 border-black dark:border-white rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
              Loading projects...
            </div>
          ) : error ? (
            <div className="px-4 py-2 text-red-500 dark:text-red-400">
              Error loading projects
            </div>
          ) : projects && projects.length > 0 ? (
            projects.map((project) => (
              <button
                key={project.id}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  ${selectedId === project.id ? "bg-blue-100 dark:bg-blue-900" : ""}`}
                onClick={() => {
                  onSelect(project);
                  setIsOpen(false);
                }}
              >
                {project.name}
                {project.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {project.description}
                  </p>
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
              No projects found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
