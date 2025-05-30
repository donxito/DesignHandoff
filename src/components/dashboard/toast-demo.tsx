"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/retroui/Button";

interface ProjectData {
  name: string;
}

export default function ToastDemo() {
  const { toast, success, error, warning, info, promise, dismiss } = useToast();

  // Simulate a promise that resolves after 2 seconds
  const handlePromise = () => {
    return promise<ProjectData>(
      () =>
        new Promise<ProjectData>((resolve) => {
          setTimeout(() => {
            resolve({ name: "Project data" });
          }, 2000);
        }),
      {
        loading: "Loading project data...",
        success: (data) => `Successfully loaded ${data.name}!`,
        error: "Failed to load project data",
      }
    );
  };

  // Simulate a promise that rejects after 2 seconds
  const handlePromiseError = () => {
    return promise(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Network error"));
          }, 2000);
        }),
      {
        loading: "Loading project data...",
        success: "This will never show!",
        error: (error: unknown) =>
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    );
  };

  return (
    <div className="p-6 border-3 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-6">Toast Notification System</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          onClick={() => toast({ message: "Default toast notification!" })}
        >
          Default Toast
        </Button>

        <Button
          onClick={() =>
            success("Success toast notification!", {
              description: "Operation completed successfully.",
            })
          }
          variant="primary"
        >
          Success Toast
        </Button>

        <Button
          onClick={() =>
            error("Error toast notification!", {
              description: "Something went wrong.",
            })
          }
          variant="outline"
        >
          Error Toast
        </Button>

        <Button
          onClick={() =>
            warning("Warning toast notification!", {
              description: "Proceed with caution.",
            })
          }
          variant="primary"
        >
          Warning Toast
        </Button>

        <Button
          onClick={() =>
            info("Info toast notification!", {
              description: "Here's some information for you.",
            })
          }
          variant="primary"
        >
          Info Toast
        </Button>

        <Button
          onClick={() =>
            toast({
              message: "Toast with action",
              description: "This toast has an action button.",
              action: {
                label: "Undo",
                onClick: () => console.log("Undo clicked"),
              },
            })
          }
        >
          Toast with Action
        </Button>

        <Button onClick={handlePromise}>Promise Toast (Success)</Button>

        <Button onClick={handlePromiseError} variant="outline">
          Promise Toast (Error)
        </Button>

        <Button onClick={() => dismiss()} variant="secondary">
          Dismiss All Toasts
        </Button>
      </div>
    </div>
  );
}
