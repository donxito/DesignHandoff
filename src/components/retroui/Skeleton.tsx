import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "rounded" | "circle";
  animate?: boolean;
}

const Skeleton = ({
  className,
  variant = "default",
  animate = true,
  ...props
}: SkeletonProps) => {
  const variantStyles = {
    default: "rounded",
    rounded: "rounded-lg",
    circle: "rounded-full",
  };

  return (
    <div
      className={cn(
        "bg-gray-200 dark:bg-gray-800 relative overflow-hidden",
        variantStyles[variant],
        animate && "animate-pulse",
        className
      )}
      {...props}
    >
      {animate && <div className="absolute inset-0 shimmer" />}
    </div>
  );
};

Skeleton.displayName = "Skeleton";

// Specialized skeleton components for common patterns
const SkeletonCard = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "border-3 border-gray-300 dark:border-gray-700 rounded-lg",
        "shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]",
        "bg-white dark:bg-gray-900 p-6 animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const SkeletonText = ({
  className,
  lines = 1,
  ...props
}: HTMLAttributes<HTMLDivElement> & { lines?: number }) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
};

const SkeletonAvatar = ({
  className,
  size = "md",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg" | "xl";
}) => {
  const sizeStyles = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <Skeleton
      variant="circle"
      className={cn(sizeStyles[size], className)}
      {...props}
    />
  );
};

const SkeletonButton = ({
  className,
  size = "md",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
}) => {
  const sizeStyles = {
    sm: "h-8 w-16",
    md: "h-10 w-20",
    lg: "h-12 w-24",
  };

  return (
    <Skeleton
      variant="rounded"
      className={cn(sizeStyles[size], className)}
      {...props}
    />
  );
};

// Export the main component with subcomponents
const SkeletonComponent = Object.assign(Skeleton, {
  Card: SkeletonCard,
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
  Button: SkeletonButton,
});

export { SkeletonComponent as Skeleton };
