import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-bold border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]",
  {
    variants: {
      variant: {
        default: "bg-gray-200 dark:bg-gray-700 text-black dark:text-white",
        primary: "bg-pink-400 dark:bg-pink-600 text-white dark:text-white",
        secondary: "bg-blue-400 dark:bg-blue-600 text-white dark:text-white",
        success: "bg-green-400 dark:bg-green-600 text-white dark:text-white",
        warning: "bg-yellow-400 dark:bg-yellow-500 text-black dark:text-black",
        danger: "bg-red-400 dark:bg-red-600 text-white dark:text-white",
        outline: "bg-transparent text-black dark:text-white",
        solid: "bg-black dark:bg-white text-white dark:text-black",
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded-sm",
        md: "px-3 py-1 text-sm rounded-sm",
        lg: "px-4 py-1.5 text-base rounded-sm",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
