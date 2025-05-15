import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  variant?: "default" | "outline" | "solid" | "primary" | "secondary";
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
    outline: "border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
    solid: "border-3 border-black bg-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]",
    primary: "border-3 border-black bg-pink-100 shadow-[3px_3px_0px_0px_rgba(236,72,153,1)]",
    secondary: "border-3 border-black bg-blue-100 shadow-[3px_3px_0px_0px_rgba(59,130,246,1)]",
  };

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-14 w-14 rounded-full overflow-hidden",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "Avatar.Image";

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-yellow-300 text-black font-bold",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "Avatar.Fallback";

const AvatarComponent = Object.assign(Avatar, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
});

export { AvatarComponent as Avatar };
