import { Skeleton } from "../Skeleton";

export function CommentSkeleton() {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-start gap-3">
        <Skeleton.Avatar size="sm" />

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>

          <Skeleton.Text lines={2} />

          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CommentSkeletonWithReplies() {
  return (
    <div className="space-y-3">
      <CommentSkeleton />
      {/* Reply comments */}
      <div className="ml-8 space-y-3">
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    </div>
  );
}

export function CommentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeletonWithReplies key={i} />
      ))}
    </div>
  );
}
