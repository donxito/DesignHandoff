// Base skeleton component
export { Skeleton } from "../Skeleton";

// Specialized skeleton components
export * from "./ProjectCardSkeleton";
export * from "./FileListSkeleton";
export * from "./TeamMemberSkeleton";
export * from "./CommentSkeleton";
export * from "./DesignSpecSkeleton";
export * from "./DashboardSkeleton";

// Loading components
export * from "./LoadingSpinner";

// Generic loading component for pages
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
      <div className="h-60 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
    </div>
  );
}
