import { Skeleton } from "../Skeleton";

export function ProjectCardSkeleton() {
  return (
    <Skeleton.Card className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-3">
          {/* Project title */}
          <Skeleton className="h-6 w-1/3" />

          {/* Project description */}
          <Skeleton.Text lines={2} className="w-2/3" />

          {/* Status badges */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Team avatars */}
          <div className="flex gap-2 mt-4">
            <Skeleton.Avatar size="sm" />
            <Skeleton.Avatar size="sm" />
            <Skeleton.Avatar size="sm" />
            <div className="flex items-center ml-2">
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Skeleton.Button size="md" />
          <Skeleton.Button size="sm" />
        </div>
      </div>
    </Skeleton.Card>
  );
}

export function ProjectCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
