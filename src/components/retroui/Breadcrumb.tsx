import { cn } from "@/lib/utils";
import React, { HTMLAttributes } from "react";

export interface BreadcrumbProps extends HTMLAttributes<HTMLDivElement> {}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 font-pixel",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

const BreadcrumbItem = React.forwardRef<HTMLDivElement, BreadcrumbItemProps>(
  ({ className, children, active = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          active ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-600 dark:text-neutral-400",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbSeparator = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-neutral-600 dark:text-neutral-400",
          className
        )}
        {...props}
      >
        {children || "/"}
      </div>
    );
  }
);

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator };
