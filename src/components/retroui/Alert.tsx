import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Legacy status to variant mapping
const statusToVariant = {
  error: "destructive",
  success: "success",
  warning: "default",
  info: "default",
} as const;

type LegacyStatus = keyof typeof statusToVariant;

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  status?: LegacyStatus; // Legacy prop for backward compatibility
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, status, ...props }, ref) => {
    // Use status prop if provided (legacy), otherwise use variant
    const computedVariant = status ? statusToVariant[status] : variant;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant: computedVariant }), className)}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// Add compound component support for legacy API
const AlertWithCompounds = Object.assign(Alert, {
  Title: AlertTitle,
  Description: AlertDescription,
});

export { AlertWithCompounds as Alert, AlertTitle, AlertDescription };
