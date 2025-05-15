import { cn } from "@/lib/utils";
import React, { HTMLAttributes } from "react";

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "outline";
}

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-white border-black",
      primary: "bg-pink-100 border-pink-500",
      secondary: "bg-blue-100 border-blue-500",
      outline: "bg-transparent border-black",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-1 p-3 border-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)]",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Menu.displayName = "Menu";

export interface MenuItemProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ className, children, active = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-4 py-2 cursor-pointer font-pixel transition-all",
          active
            ? "bg-primary text-neutral-900 dark:text-neutral-900 border-2 border-neutral-900 dark:border-neutral-900"
            : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MenuItem.displayName = "MenuItem";

export { Menu, MenuItem };
