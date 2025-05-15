import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "font-head transition-all outline-none cursor-pointer flex items-center justify-center relative",
  {
    variants: {
      variant: {
        default:
          "bg-yellow-400 text-black border-3 border-black hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        primary:
          "bg-pink-500 text-white border-3 border-black hover:bg-pink-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        secondary:
          "bg-blue-500 text-white border-3 border-black hover:bg-blue-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        outline:
          "bg-white text-black border-3 border-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        solid:
          "bg-black text-white border-3 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        link: "bg-transparent text-black hover:underline p-0 border-0 shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0",
      },
      size: {
        sm: "px-4 py-1.5 text-sm",
        md: "px-6 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg font-bold",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      children,
      size = "md",
      className = "",
      variant = "default",
      ...props
    }: IButtonProps,
    forwardedRef,
  ) => (
    <button
      ref={forwardedRef}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";
