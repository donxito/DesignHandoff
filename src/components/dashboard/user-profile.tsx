"use client";

import { useState, useEffect } from "react";
import { useCurrentUser, useUpdateProfile } from "@/hooks/use-users-query";
import { profileSchema, type ProfileFormData } from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Avatar } from "@/components/retroui/Avatar";
import { Alert } from "@/components/retroui/Alert";

export default function UserProfile() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // * React hook form with Zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || "",
    },
  });

  // * Update form values when user data loads
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.full_name || "",
      });
    }
  }, [user, reset]);

  // * Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    setSuccess(null);

    try {
      await updateProfileMutation.mutateAsync({
        full_name: data.fullName,
      });

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      // Error will be handled by the mutation
      console.error("Failed to update profile", err);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl p-6">
      <Card.Header>
        <Card.Title>Your Profile</Card.Title>
      </Card.Header>

      <Card.Content>
        {updateProfileMutation.isError && (
          <Alert status="error" className="mb-6">
            <Alert.Description>
              {updateProfileMutation.error instanceof Error
                ? updateProfileMutation.error.message
                : "Failed to update profile. Please try again."}
            </Alert.Description>
          </Alert>
        )}

        {success && (
          <Alert status="success" className="mb-6">
            <Alert.Description>{success}</Alert.Description>
          </Alert>
        )}

        <div className="flex items-center mb-6">
          <Avatar variant="primary" className="w-20 h-20 mr-4">
            <div className="flex items-center justify-center w-full h-full bg-pink-200 text-black font-bold text-2xl">
              {user?.full_name
                ? user.full_name.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || "?"}
            </div>
          </Avatar>

          <div>
            <Text as="h3" className="text-xl font-bold">
              {user?.full_name || "User"}
            </Text>
            <Text as="p" className="text-gray-600 dark:text-gray-300">
              {user?.email}
            </Text>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              {...register("fullName")}
              error={errors.fullName?.message}
            />

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting || updateProfileMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || updateProfileMutation.isPending}
              >
                {isSubmitting || updateProfileMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <Text
                as="h4"
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Email
              </Text>
              <Text as="p" className="font-medium">
                {user?.email}
              </Text>
            </div>

            <div>
              <Text
                as="h4"
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Full Name
              </Text>
              <Text as="p" className="font-medium">
                {user?.full_name || "Not set"}
              </Text>
            </div>

            <div>
              <Text
                as="h4"
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Account Created
              </Text>
              <Text as="p" className="font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "Unknown"}
              </Text>
            </div>

            <div className="pt-4">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
