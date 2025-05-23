"use client";

import { useState } from "react";
import {
  ProjectFilters,
  ProjectSortField,
  ProjectSortOrder,
} from "@/lib/types/project";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { ChevronDown, Filter, X, SortAsc, SortDesc } from "lucide-react";

interface ProjectFilterProps {
  filters: ProjectFilters;
  sortField: ProjectSortField;
  sortOrder: ProjectSortOrder;
  onFiltersChange: (filters: ProjectFilters) => void;
  onSortChange: (field: ProjectSortField, order: ProjectSortOrder) => void;
  onClearFilters: () => void;
  resultCount?: number;
}

const sortOptions: { field: ProjectSortField; label: string }[] = [
  { field: "created_at", label: "Created Date" },
  { field: "updated_at", label: "Updated Date" },
  { field: "name", label: "Name" },
  //   { field: "files_count", label: "Files Count" },
  //   { field: "members_count", label: "Members Count" },
];

export default function ProjectFiltersComponent({
  filters,
  sortField,
  sortOrder,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  resultCount,
}: ProjectFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<ProjectFilters>(filters);

  // * update filters with debounced search
  const updateFilters = (newFilters: Partial<ProjectFilters>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // * check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value.length > 0
  );

  // * get active filter count
  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value.length > 0
  ).length;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            placeholder="Search projects by name or description..."
            value={localFilters.search || ""}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={sortField}
              onChange={(e) =>
                onSortChange(e.target.value as ProjectSortField, sortOrder)
              }
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border-3 border-black dark:border-white rounded-md font-pixel text-black dark:text-white appearance-none pr-10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]"
            >
              {sortOptions.map((option) => (
                <option key={option.field} value={option.field}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSortChange(sortField, sortOrder === "asc" ? "desc" : "asc")
            }
            className="flex items-center gap-2"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge variant="primary" className="ml-1 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <Card className="p-4 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <div className="flex justify-between items-center mb-4">
            <Text
              as="h3"
              className="text-lg font-bold font-pixel text-black dark:text-white"
            >
              Advanced Filters
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">
                Created From
              </label>
              <Input
                type="date"
                value={localFilters.dateFrom || ""}
                onChange={(e) => updateFilters({ dateFrom: e.target.value })}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">
                Created To
              </label>
              <Input
                type="date"
                value={localFilters.dateTo || ""}
                onChange={(e) => updateFilters({ dateTo: e.target.value })}
              />
            </div>

            {/* Status Filter - Future Implementation */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">
                Status (Coming Soon)
              </label>
              <select
                disabled
                className="px-4 py-2.5 w-full bg-gray-100 dark:bg-gray-700 border-3 border-gray-300 dark:border-gray-600 rounded-md font-pixel text-gray-500 opacity-50"
              >
                <option>All Statuses</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Results Count */}
      {resultCount !== undefined && (
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <Text as="span" className="font-pixel">
            {resultCount} project{resultCount !== 1 ? "s" : ""} found
          </Text>
          {hasActiveFilters && (
            <Button
              variant="link"
              size="sm"
              onClick={onClearFilters}
              className="text-sm font-pixel underline"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
