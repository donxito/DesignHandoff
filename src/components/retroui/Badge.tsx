import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
  {
    variants: {
      variant: {
        default: "bg-gray-200 text-black",
        primary: "bg-pink-400 text-white",
        secondary: "bg-blue-400 text-white",
        success: "bg-green-400 text-white",
        warning: "bg-yellow-400 text-black",
        danger: "bg-red-400 text-white",
        outline: "bg-transparent text-black",
        solid: "bg-black text-white",
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
