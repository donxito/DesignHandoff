import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { Text } from "./Text";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "outline";
}

const Card = ({ className, variant = "default", ...props }: CardProps) => {
  const variantStyles = {
    default: "bg-white dark:bg-gray-900 border-black dark:border-white",
    primary: "bg-white dark:bg-gray-900 border-pink-500",
    secondary: "bg-white dark:bg-gray-900 border-blue-500",
    outline: "bg-transparent border-black dark:border-white",
  };

  return (
    <div
      className={cn(
        "border-3 rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};

Card.displayName = "Card";

const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("p-6 border-b-3 border-black dark:border-white", className)}
      {...props}
    />
  );
};

CardHeader.displayName = "CardHeader";

const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
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

const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("p-6", className)} {...props} />;
};

CardContent.displayName = "CardContent";

const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("p-6 border-t-3 border-black dark:border-white", className)}
      {...props}
    />
  );
};

CardFooter.displayName = "CardFooter";

const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
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

// Export the Card component with its subcomponents
const CardComponent = Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
  Description: CardDescription,
});

// Export both individual components and the compound component
export {
  CardComponent as Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
};
