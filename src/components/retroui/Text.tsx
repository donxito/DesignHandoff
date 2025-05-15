import type { ElementType, HTMLAttributes } from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    as: {
      p: "font-sans leading-relaxed",
      li: "font-sans leading-relaxed",
      a: "font-sans text-blue-600 hover:underline underline-offset-4 decoration-2 decoration-blue-500 font-medium",
      h1: "font-bold tracking-tight",
      h2: "font-bold tracking-tight",
      h3: "font-bold tracking-tight",
      h4: "font-bold",
      h5: "font-bold",
      h6: "font-bold",
      span: "inline",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    variant: {
      default: "text-black dark:text-white",
      primary: "text-pink-600 dark:text-pink-400",
      secondary: "text-blue-600 dark:text-blue-400",
      success: "text-green-600 dark:text-green-400",
      warning: "text-yellow-600 dark:text-yellow-400",
      danger: "text-red-600 dark:text-red-400",
      muted: "text-gray-600 dark:text-gray-400",
      outline: "text-black dark:text-white",
    },
  },
  defaultVariants: {
    as: "p",
    size: "base",
    variant: "default",
  },
});

interface TextProps
  extends Omit<HTMLAttributes<HTMLElement>, "className">,
    VariantProps<typeof textVariants> {
  className?: string;
  weight?: "normal" | "medium" | "semibold" | "bold";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "muted" | "outline";
}

export const Text = (props: TextProps) => {
  const { className, as, weight, size, variant, ...otherProps } = props;
  const Tag: ElementType = as || "p";

  return (
    <Tag className={cn(textVariants({ as, weight, size, variant }), className)} {...otherProps} />
  );
};
