import { useUIStore } from "@/lib/store";
import { toast as retroToast, ToastProps } from "@/components/retroui/toast";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

// * Custom hook that combines the toast component with the store
export function useToast() {
  const { addNotification, removeNotification } = useUIStore();

  // Show a toast notification
  const toast = useCallback(
    ({ message, variant = "default", ...rest }: ToastProps) => {
      const id = uuidv4();

      // Add to store for potential persistence
      addNotification({
        id,
        type: variant === "default" ? "info" : variant,
        message,
        duration: rest.duration || 5000,
      });

      // Show the toast using our toast component
      return retroToast({
        message,
        variant,
        ...rest,
        onDismiss: () => {
          removeNotification(id);
          if (rest.onDismiss) rest.onDismiss();
        },
      });
    },
    [addNotification, removeNotification]
  );

  // * variant helpers
  const success = useCallback(
    (message: string, options?: Omit<ToastProps, "message" | "variant">) => {
      return toast({ message, variant: "success", ...options });
    },
    [toast]
  );

  const error = useCallback(
    (message: string, options?: Omit<ToastProps, "message" | "variant">) => {
      return toast({ message, variant: "error", ...options });
    },
    [toast]
  );

  const warning = useCallback(
    (message: string, options?: Omit<ToastProps, "message" | "variant">) => {
      return toast({ message, variant: "warning", ...options });
    },
    [toast]
  );

  const info = useCallback(
    (message: string, options?: Omit<ToastProps, "message" | "variant">) => {
      return toast({ message, variant: "info", ...options });
    },
    [toast]
  );

  // * Promise toast helper
  const promise = useCallback(
    <T>(
      promiseFn: () => Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) => {
      const id = uuidv4();

      // Add loading notification to store
      addNotification({
        id,
        type: "info",
        message: options.loading,
        duration: 0, // Persists until resolved
      });

      // Create the toast
      return retroToast.promise(async () => {
        try {
          const result = await promiseFn();
          // Update notification in store when promise resolves
          const successMessage =
            typeof options.success === "function"
              ? options.success(result)
              : options.success;

          // Replace the notification
          removeNotification(id);
          addNotification({
            id: uuidv4(), //  ID for success notification
            type: "success",
            message: successMessage,
            duration: 5000,
          });

          return result;
        } catch (error) {
          // Update notification in store when promise rejects
          const errorMessage =
            typeof options.error === "function"
              ? options.error(error)
              : options.error;

          // Replace the notification
          removeNotification(id);
          addNotification({
            id: uuidv4(), // ID for error notification
            type: "error",
            message: errorMessage,
            duration: 5000,
          });

          throw error;
        }
      }, options);
    },
    [addNotification, removeNotification]
  );

  // * Dismiss helper
  const dismiss = useCallback(
    (toastId?: string) => {
      if (toastId) {
        removeNotification(toastId);
      }
      retroToast.dismiss(toastId);
    },
    [removeNotification]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
    promise,
    dismiss,
  };
}
