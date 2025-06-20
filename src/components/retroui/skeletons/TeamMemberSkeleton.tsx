import { Skeleton } from "../Skeleton";

export function TeamMemberSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 animate-pulse">
      {/* Avatar */}
      <Skeleton.Avatar size="md" />

      {/* Member info */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-16 rounded-full" /> {/* Role badge */}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

export function TeamMemberListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TeamMemberSkeleton key={i} />
      ))}
    </div>
  );
}

export function UserProfileSkeleton() {
  return (
    <Skeleton.Card className="max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton.Avatar size="xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton.Text lines={3} />
        </div>
        <div className="flex gap-2">
          <Skeleton.Button size="md" />
          <Skeleton.Button size="md" />
        </div>
      </div>
    </Skeleton.Card>
  );
}
