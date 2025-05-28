import { z } from "zod";
import { PROJECT_STATUS } from "@/lib/types/project";

// * Schema for project creation and updates
export const projectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name cannot be longer than 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot be longer than 500 characters")
    .nullable()
    .optional(),
  status: z.enum([...PROJECT_STATUS] as const).optional(),
});

// * Type for project form data
export type ProjectFormData = z.infer<typeof projectSchema>;

// * Schema for user authentication, login
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// * Type for login form data
export type LoginFormData = z.infer<typeof loginSchema>;

// * Schema for user registration
export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password cannot be longer than 72 characters"),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot be longer than 100 characters"),
});

// * Type for signup form data
export type SignupFormData = z.infer<typeof signupSchema>;

// * Schema for profile updates
export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot be longer than 100 characters")
    .optional(),
  avatar_url: z.string().url("Please enter a valid URL").optional().nullable(),
});

// * Type for profile form data
export type ProfileFormData = z.infer<typeof profileSchema>;

// * Schema for comment creation
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment cannot be longer than 500 characters"),
  designFileId: z.string().uuid("Please enter a valid design file ID"),
  parentId: z
    .string()
    .uuid("Please enter a valid parent ID")
    .optional()
    .nullable(),
  x: z.number().optional().nullable(),
  y: z.number().optional().nullable(),
});

// * Type for comment form data
export type CommentFormData = z.infer<typeof commentSchema>;

// * Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(72, "Password cannot be longer than 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// * email change schema
export const emailChangeSchema = z.object({
  newEmail: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string().min(1, "Password is required to change email"),
});

export type EmailChangeFormData = z.infer<typeof emailChangeSchema>;

// * delete account schema
export const accountDeletionSchema = z.object({
  confirmationText: z
    .string()
    .refine(
      (text) => text === "DELETE MY ACCOUNT",
      "Please type 'DELETE MY ACCOUNT' to confirm"
    ),
  password: z.string().min(1, "Password is required to delete account"),
});

export type AccountDeletionFormData = z.infer<typeof accountDeletionSchema>;
