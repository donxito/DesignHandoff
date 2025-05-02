"use client";

import { FolderOpen, Calendar, MoreVertical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Link href={`/dashboard/projects/${project.id}`} className="block group">
      <div className="bg-white border rounded-lg overflow-hidden transition-shadow hover:shadow-md">
        {/* Project thumbnail */}
        <div className="h-40 bg-gradient-to-r from-blue-50 to-blue-100 relative">
          {project.thumbnail_url ? (
            <Image
              src={project.thumbnail_url}
              alt={project.name}
              className="object-cover"
              fill
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderOpen size={64} className="text-blue-400" />
            </div>
          )}
        </div>

        {/* Project info */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <button
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              onClick={(e) => {
                e.preventDefault();
                // Additional actions can be added here
              }}
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {project.description && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="mt-4 flex items-center text-xs text-gray-500">
            <Calendar size={14} />
            <span className="ml-1">{formatDate(project.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
