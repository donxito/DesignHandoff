"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-users-query";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  changePassword,
  updateEmail,
  deleteAccount,
} from "@/lib/supabase/auth";
import {
  passwordChangeSchema,
  emailChangeSchema,
  accountDeletionSchema,
  type PasswordChangeFormData,
  type EmailChangeFormData,
} from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Alert } from "@/components/retroui/Alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/retroui/Dialog";
import { Mail, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function AccountSettings() {
  const { data: user } = useCurrentUser();
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // * Password Change Form
  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // * Email Change Form
  const emailForm = useForm<EmailChangeFormData>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  });

  // * Account Deletion Form
  type DeleteFormValues = {
    confirmationText: string;
    password: string;
  };

  const deleteForm = useForm<DeleteFormValues>({
    resolver: zodResolver(accountDeletionSchema),
    defaultValues: {
      confirmationText: "",
      password: "",
    },
  });

  // Handle password change
  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    try {
      const { error } = await changePassword(
        data.currentPassword,
        data.newPassword
      );

      if (error) {
        toast({
          message: "Password change failed",
          description: error.message,
          variant: "error",
        });
        return;
      }

      toast({
        message: "Password updated",
        description: "Your password has been successfully updated.",
        variant: "success",
      });

      passwordForm.reset();
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        message: "Password change failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "error",
      });
    }
  };

  // Handle email change
  const handleEmailChange = async (data: EmailChangeFormData) => {
    try {
      const { error } = await updateEmail(data.newEmail);

      if (error) {
        toast({
          message: "Email change failed",
          description: error.message,
          variant: "error",
        });
        return;
      }

      toast({
        message: "Email update initiated",
        description: "Please check your new email for a confirmation link.",
        variant: "success",
      });

      emailForm.reset();
    } catch (error) {
      console.error("Email change error:", error);
      toast({
        message: "Email change failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "error",
      });
    }
  };

  // Handle account deletion
  const handleAccountDeletion = async () => {
    try {
      const { error } = await deleteAccount();

      if (error) {
        toast({
          message: "Account deletion failed",
          description: error.message,
          variant: "error",
        });
        return;
      }

      toast({
        message: "Account deleted",
        description: "Your account has been successfully deleted.",
        variant: "success",
      });

      // Log out and redirect
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Account deletion error:", error);
      toast({
        message: "Account deletion failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Password Change Section */}
      <Card className="p-6">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Change Password
          </Card.Title>
          <Card.Description>
            Update your password to keep your account secure
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
            className="space-y-4"
          >
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                label="Current Password"
                {...passwordForm.register("currentPassword")}
                error={passwordForm.formState.errors.currentPassword?.message}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                label="New Password"
                {...passwordForm.register("newPassword")}
                error={passwordForm.formState.errors.newPassword?.message}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm New Password"
                {...passwordForm.register("confirmPassword")}
                error={passwordForm.formState.errors.confirmPassword?.message}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={passwordForm.formState.isSubmitting}
                className="flex items-center gap-2"
              >
                {passwordForm.formState.isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* Email Change Section */}
      <Card className="p-6">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Change Email Address
          </Card.Title>
          <Card.Description>
            Update your email address. You&apos;ll need to verify your new
            email.
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Text
              as="p"
              className="text-sm font-pixel text-gray-600 dark:text-gray-300"
            >
              Current email: <strong>{user?.email}</strong>
            </Text>
          </div>

          <form
            onSubmit={emailForm.handleSubmit(handleEmailChange)}
            className="space-y-4"
          >
            <Input
              type="email"
              label="New Email Address"
              {...emailForm.register("newEmail")}
              error={emailForm.formState.errors.newEmail?.message}
              placeholder="Enter your new email address"
            />

            <div className="relative">
              <Input
                type={showEmailPassword ? "text" : "password"}
                label="Current Password"
                {...emailForm.register("password")}
                error={emailForm.formState.errors.password?.message}
                placeholder="Enter your current password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowEmailPassword(!showEmailPassword)}
              >
                {showEmailPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={emailForm.formState.isSubmitting}
                className="flex items-center gap-2"
              >
                {emailForm.formState.isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Email"
                )}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 dark:border-red-800">
        <Card.Header>
          <Card.Title className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </Card.Title>
          <Card.Description>
            Irreversible and destructive actions
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start justify-between">
              <div>
                <Text
                  as="h4"
                  className="font-bold font-pixel text-red-800 dark:text-red-200 mb-1"
                >
                  Delete Account
                </Text>
                <Text
                  as="p"
                  className="text-sm font-pixel text-red-700 dark:text-red-300"
                >
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </Text>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="ml-4 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Delete Account Dialog */}
      {isDeleteDialogOpen && (
        <Dialog defaultOpen={true} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="rounded-lg">
            <DialogHeader>
              <Text
                as="h2"
                className="text-xl font-bold font-pixel text-red-600 dark:text-red-400"
              >
                Delete Account
              </Text>
              <Text
                as="p"
                className="text-sm font-pixel text-black dark:text-white"
              >
                This action is permanent and cannot be undone. All your
                projects, files, and data will be deleted.
              </Text>
            </DialogHeader>

            <Alert status="error" className="my-4">
              <Alert.Description>
                <strong>Warning:</strong> This will permanently delete your
                account and all associated data.
              </Alert.Description>
            </Alert>

            <form
              onSubmit={deleteForm.handleSubmit(handleAccountDeletion)}
              className="space-y-4"
            >
              <Input
                label="Type 'DELETE MY ACCOUNT' to confirm"
                {...deleteForm.register("confirmationText")}
                error={deleteForm.formState.errors.confirmationText?.message}
                placeholder="DELETE MY ACCOUNT"
              />

              <div className="relative">
                <Input
                  type={showDeletePassword ? "text" : "password"}
                  label="Current Password"
                  {...deleteForm.register("password")}
                  error={deleteForm.formState.errors.password?.message}
                  placeholder="Enter your current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                >
                  {showDeletePassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={deleteForm.formState.isSubmitting}
                >
                  {deleteForm.formState.isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete My Account"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
