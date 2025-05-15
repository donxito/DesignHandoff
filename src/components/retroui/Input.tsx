import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = "text",
  placeholder = "Enter text",
  className = "",
  label,
  error,
  helperText,
  ...props
}, ref) => {
  const id = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-black dark:text-white mb-1.5">{label}</label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          className={cn(
            "px-4 py-2.5 w-full rounded-md bg-white dark:bg-gray-800 border-3 transition-all duration-200",
            "border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]",
            "focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.5)] focus:translate-x-[2px] focus:translate-y-[2px] focus:outline-none",
            "placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-white",
            error || props["aria-invalid"] 
              ? "border-red-500 shadow-[3px_3px_0px_0px_rgba(239,68,68,1)] dark:shadow-[3px_3px_0px_0px_rgba(239,68,68,0.5)] focus:shadow-[1px_1px_0px_0px_rgba(239,68,68,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(239,68,68,0.5)]" 
              : "",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <Text as="p" size="sm" variant="danger" className="mt-1.5">{error}</Text>
      )}
      {helperText && !error && (
        <Text as="p" size="xs" variant="muted" className="mt-1">{helperText}</Text>
      )}
    </div>
  );
});

Input.displayName = "Input";
