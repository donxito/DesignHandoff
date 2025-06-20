import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "muted";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "primary",
  className,
}: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-3",
  };

  const variantStyles = {
    primary: "border-blue-500 border-t-transparent",
    secondary: "border-gray-500 border-t-transparent",
    muted: "border-gray-300 dark:border-gray-600 border-t-transparent",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    />
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        className="w-2 h-2 bg-current rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="w-2 h-2 bg-current rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="w-2 h-2 bg-current rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  showPercentage = true,
  className,
}: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-gray-200 dark:bg-gray-800 h-3 border-2 border-black dark:border-white">
        <div
          className="bg-blue-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-center">
          <span className="text-sm font-pixel text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}
