import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";
import { Text } from "./Text";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "outline";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-white dark:bg-gray-900 border-black dark:border-white",
      primary: "bg-white dark:bg-gray-900 border-pink-500",
      secondary: "bg-white dark:bg-gray-900 border-blue-500",
      outline: "bg-transparent border-black dark:border-white",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "border-3 rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)]",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-6 border-b-3 border-black dark:border-white", className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <Text
      as="h3"
      size="2xl"
      weight="bold"
      className={cn("tracking-tight", className)}
      {...props}
    />
  );
};

CardTitle.displayName = "CardTitle";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-6", className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = "CardContent";

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-6 border-t-3 border-black dark:border-white", className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = "CardFooter";

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = ({ className, ...props }: CardDescriptionProps) => {
  return (
    <Text
      as="p"
      size="sm"
      variant="muted"
      className={cn("", className)}
      {...props}
    />
  );
};

CardDescription.displayName = "CardDescription";

const CardComponent = Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});

export { CardComponent as Card };
