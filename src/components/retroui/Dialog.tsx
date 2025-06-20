"use client";

import { cn } from "@/lib/utils";
import React, {
  HTMLAttributes,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { createPortal } from "react-dom";

type DialogContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    { className, children, defaultOpen = false, onOpenChange, ...props },
    ref
  ) => {
    const [open, setOpen] = useState(defaultOpen);

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    return (
      <DialogContext.Provider value={{ open, setOpen: handleOpenChange }}>
        <div ref={ref} className={cn(className)} {...props}>
          {children}
        </div>
      </DialogContext.Provider>
    );
  }
);

Dialog.displayName = "Dialog";

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("DialogTrigger must be used within a Dialog component");
  }

  const { setOpen } = context;

  return (
    <button
      ref={ref}
      className={cn(className)}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
});

DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("DialogContent must be used within a Dialog component");
  }

  const { open, setOpen } = context;
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before creating portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      // Prevent scrolling
      document.body.style.overflow = "hidden";

      // Cleanup function to restore scroll
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open || !mounted) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647, // Max z-index value
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div
        ref={ref}
        className={cn(
          "relative bg-white p-6 max-w-lg w-full border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-900 dark:border-white dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)]",
          className
        )}
        {...props}
      >
        {children}
        <button
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
});

DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "mb-6 pb-4 text-center border-b-3 border-black bg-gradient-to-r from-yellow-300 to-yellow-400 -mx-6 -mt-6 p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "mt-6 flex justify-end gap-3 pt-4 border-t-3 border-black -mx-6 -mb-6 p-4 bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn("text-2xl font-bold text-black", className)}
      {...props}
    >
      {children}
    </h2>
  );
});

DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600 mt-2", className)}
      {...props}
    >
      {children}
    </p>
  );
});

DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
