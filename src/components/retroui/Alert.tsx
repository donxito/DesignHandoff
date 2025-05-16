import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Text } from "@/components/retroui/Text";

const alertVariants = cva(
  "relative w-full rounded-lg border-3 p-5 mb-4",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-gray-900 text-black dark:text-white border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]",
        solid: "bg-black text-white border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] dark:bg-white dark:text-black dark:border-black dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      },
      status: {
        error: "bg-red-50 dark:bg-red-950 border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] dark:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)]",
        success: "bg-green-50 dark:bg-green-950 border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] dark:shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)]",
        warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-500 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)] dark:shadow-[4px_4px_0px_0px_rgba(234,179,8,0.5)]",
        info: "bg-blue-50 dark:bg-blue-950 border-blue-500 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] dark:shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  status?: "error" | "success" | "warning" | "info";
}

const Alert = ({ className, variant, status, ...props }: AlertProps) => {
  const StatusIcon = status ? {
    error: XCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info
  }[status] : null;
  
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant, status }), className)}
      {...props}
    >
      {StatusIcon && (
        <div className="absolute top-3 right-3">
          <StatusIcon className={cn(
            "h-5 w-5",
            status === "error" && "text-red-500",
            status === "success" && "text-green-500",
            status === "warning" && "text-yellow-500",
            status === "info" && "text-blue-500"
          )} />
        </div>
      )}
      {props.children}
    </div>
  );
};

Alert.displayName = "Alert";

const AlertTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <Text as="h5" size="lg" weight="bold" className={cn("mb-1", className)} {...props} />
);

const AlertDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <Text as="p" size="base" className={cn("", className)} {...props} />
);

AlertDescription.displayName = "AlertDescription";

const AlertComponent = Object.assign(Alert, {
  Title: AlertTitle,
  Description: AlertDescription,
});

export { AlertComponent as Alert };
