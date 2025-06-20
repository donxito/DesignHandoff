import { Skeleton } from "../Skeleton";

export function FileItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 animate-pulse">
      {/* File icon */}
      <Skeleton className="w-10 h-10 rounded" />

      {/* File info */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Skeleton.Button size="sm" />
        <Skeleton.Button size="sm" />
      </div>
    </div>
  );
}

export function FileListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <FileItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function FileGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton.Card key={i} className="aspect-square">
          <div className="space-y-3">
            {/* File preview */}
            <Skeleton className="w-full h-32 rounded" />

            {/* File name */}
            <Skeleton className="h-4 w-full" />

            {/* File size */}
            <Skeleton className="h-3 w-2/3" />
          </div>
        </Skeleton.Card>
      ))}
    </div>
  );
}
