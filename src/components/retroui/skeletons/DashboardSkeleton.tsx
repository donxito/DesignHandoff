import { Skeleton } from "../Skeleton";
import { ProjectCardSkeletonList } from "./ProjectCardSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton.Text lines={2} className="w-2/3" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton.Card key={i} className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </Skeleton.Card>
        ))}
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton.Button />
        </div>
        <ProjectCardSkeletonList count={3} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton.Card className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton.Avatar size="sm" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </Skeleton.Card>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton.Card className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </Skeleton.Card>
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton.Button />
            <Skeleton.Button />
          </div>
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton.Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 border rounded"
                >
                  <Skeleton className="w-12 h-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton.Button size="sm" />
                </div>
              ))}
            </div>
          </Skeleton.Card>
        </div>

        <div className="space-y-6">
          <Skeleton.Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton.Avatar size="sm" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </Skeleton.Card>

          <Skeleton.Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-28" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-12 w-full rounded" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </Skeleton.Card>
        </div>
      </div>
    </div>
  );
}
