"use client";

import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// * RetroUI styled toast variants
const toastVariants = cva(
  "group relative border-3 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]",
  {
    variants: {
      variant: {
        default:
          "bg-white dark:bg-gray-900 text-black dark:text-white border-black dark:border-white",
        error:
          "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-500",
        success:
          "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-500",
        warning:
          "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 border-yellow-500",
        info: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// * Type for toast parameters, extending sonner's options
export type ToastProps = {
  message: string;
  description?: string;
  variant?: "default" | "error" | "success" | "warning" | "info";
  duration?: number;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
};

// * Toast function with variants
export function toast({
  message,
  description,
  variant = "default",
  duration = 5000,
  position,
  action,
  onDismiss,
}: ToastProps) {
  const Icon =
    variant === "success"
      ? CheckCircle
      : variant === "error"
        ? AlertCircle
        : variant === "warning"
          ? AlertTriangle
          : variant === "info"
            ? Info
            : null;

  // * Map our variant to sonner's type
  const sonnerType = variant === "default" ? undefined : variant;

  // * Configure the toast options
  const options: any = {
    description,
    duration,
    position,
    onDismiss,
    icon: Icon && <Icon className="h-5 w-5" />,
    className: cn(toastVariants({ variant })),
  };

  // * Add action if provided
  if (action) {
    options.action = {
      label: action.label,
      onClick: action.onClick,
    };
  }

  // * Call appropriate sonner toast method based on variant
  if (variant === "success") {
    return sonnerToast.success(message, options);
  } else if (variant === "error") {
    return sonnerToast.error(message, options);
  } else if (variant === "warning") {
    return sonnerToast.warning
      ? sonnerToast.warning(message, options)
      : sonnerToast(message, options);
  } else if (variant === "info") {
    return sonnerToast.info
      ? sonnerToast.info(message, options)
      : sonnerToast(message, options);
  } else {
    return sonnerToast(message, options);
  }
}

// * Helper for dismissing toasts
toast.dismiss = sonnerToast.dismiss;

// * Helper for promise-based toast
type PromiseData = {
  loading: string;
  success: string | ((data: any) => string);
  error: string | ((error: any) => string);
};

toast.promise = (promiseFn: () => Promise<any>, options: PromiseData) => {
  return sonnerToast.promise(promiseFn(), {
    ...options,
    className: cn(toastVariants({ variant: "default" })),
  });
};

// * Toast container component
interface ToasterProps {
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  richColors?: boolean;
  expand?: boolean;
  closeButton?: boolean;
  visibleToasts?: number;
  offset?: string | number;
  className?: string;
}

export function Toaster({
  position = "bottom-right",
  richColors = false,
  expand = false,
  closeButton = true,
  visibleToasts = 3,
  offset = "2rem",
  className,
}: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      richColors={richColors}
      expand={expand}
      closeButton={closeButton}
      toastOptions={{
        className: cn("retroui-toast", className),
        descriptionClassName: "text-sm text-gray-600 dark:text-gray-400 mt-1",
      }}
      visibleToasts={visibleToasts}
      offset={offset}
    />
  );
}
