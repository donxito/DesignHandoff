import { Skeleton } from "../Skeleton";

export function ColorPaletteSkeleton() {
  return (
    <Skeleton.Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-full h-12 rounded" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </Skeleton.Card>
  );
}

export function TypographySkeleton() {
  return (
    <Skeleton.Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </Skeleton.Card>
  );
}

export function MeasurementToolSkeleton() {
  return (
    <Skeleton.Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </Skeleton.Card>
  );
}

export function DesignSpecViewerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Image area */}
      <Skeleton.Card className="aspect-video">
        <div className="flex items-center justify-center h-full">
          <Skeleton className="w-24 h-24 rounded" />
        </div>
      </Skeleton.Card>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ColorPaletteSkeleton />
        <TypographySkeleton />
        <MeasurementToolSkeleton />
      </div>
    </div>
  );
}
