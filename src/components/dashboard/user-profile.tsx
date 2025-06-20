"use client";

import { useState, useEffect } from "react";
import { useCurrentUser, useUpdateProfile } from "@/hooks/use-users-query";
import { profileSchema, type ProfileFormData } from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import AvatarUpload from "@/components/profile/avatar-upload";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Alert } from "@/components/retroui/Alert";
import { Badge } from "@/components/retroui/Badge";
import { formatDistanceToNow } from "date-fns";
import { User, Calendar, Mail, CheckCircle, Edit3 } from "lucide-react";
import { UserProfileSkeleton } from "@/components/retroui/skeletons";

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className }: UserProfileProps) {
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
      console.error("Failed to update profile", err);
    }
  };

  // * Calculate profile completion
  const getProfileCompletion = () => {
    if (!user) return 0;

    let completed = 0;
    const total = 3;

    if (user.full_name) completed += 1;
    if (user.email) completed += 1;
    if (user.avatar_url) completed += 1;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = getProfileCompletion();

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Completion Banner */}
      {profileCompletion < 100 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <Text
                as="h4"
                className="font-bold font-pixel text-blue-800 dark:text-blue-200"
              >
                Complete Your Profile
              </Text>
              <Text
                as="p"
                className="text-sm font-pixel text-blue-700 dark:text-blue-300"
              >
                Add a profile picture and full name to complete your profile
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <Text
                  as="span"
                  className="text-2xl font-bold font-pixel text-blue-800 dark:text-blue-200"
                >
                  {profileCompletion}%
                </Text>
                <Text
                  as="p"
                  className="text-xs font-pixel text-blue-600 dark:text-blue-300"
                >
                  Complete
                </Text>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Profile Card */}
      <Card className="max-w-2xl p-6">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-500" />
              Your Profile
            </Card.Title>
            {profileCompletion === 100 && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Complete
              </Badge>
            )}
          </div>
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

          {/* Avatar Upload Section */}
          <div className="mb-8">
            <AvatarUpload />
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Full Name"
                {...register("fullName")}
                error={errors.fullName?.message}
                placeholder="Enter your full name"
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setSuccess(null);
                    reset();
                  }}
                  disabled={isSubmitting || updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || updateProfileMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {isSubmitting || updateProfileMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Text
                      as="h4"
                      className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                    >
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </Text>
                    <Text
                      as="p"
                      className="font-medium font-pixel text-black dark:text-white"
                    >
                      {user?.email}
                    </Text>
                  </div>

                  <div>
                    <Text
                      as="h4"
                      className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                    >
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name
                    </Text>
                    <Text
                      as="p"
                      className="font-medium font-pixel text-black dark:text-white"
                    >
                      {user?.full_name || (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </Text>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Text
                      as="h4"
                      className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                    >
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Member Since
                    </Text>
                    <Text
                      as="p"
                      className="font-medium font-pixel text-black dark:text-white"
                    >
                      {user?.created_at
                        ? formatDistanceToNow(new Date(user.created_at), {
                            addSuffix: true,
                          })
                        : "Recently"}
                    </Text>
                  </div>

                  <div>
                    <Text
                      as="h4"
                      className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                    >
                      Profile Status
                    </Text>
                    <div className="flex items-center gap-2">
                      {profileCompletion === 100 ? (
                        <Badge
                          variant="success"
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge
                          variant="warning"
                          className="flex items-center gap-1"
                        >
                          {profileCompletion}% Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
