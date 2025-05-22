"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  variant?: "default" | "primary" | "secondary";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max, variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full border-3 border-black dark:border-white",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all",
            variant === "primary" && "bg-blue-500 dark:bg-blue-400",
            variant === "secondary" && "bg-pink-500 dark:bg-pink-400",
            variant === "default" && "bg-black dark:bg-white"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
