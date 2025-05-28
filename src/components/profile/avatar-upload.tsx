"use client";

import { useState, useRef } from "react";
import { useCurrentUser, useUpdateProfile } from "@/hooks/use-users-query";
import { uploadAvatar, deleteAvatarByUrl } from "@/lib/supabase/avatar-storage";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/retroui/Avatar";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Progress } from "@/components/retroui/Progress";
import { Camera, Upload, Trash2, User } from "lucide-react";

interface AvatarUploadProps {
  className?: string;
}

export default function AvatarUpload({ className }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user } = useCurrentUser();

  const updateProfileMutation = useUpdateProfile();

  const { toast } = useToast();

  // * handle file select
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !user) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);

      // upload avatar
      const avatarUrl = await uploadAvatar(file, user.id);

      // update user profile
      await updateProfileMutation.mutateAsync({
        avatar_url: avatarUrl,
      });

      // complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      // show success toast
      toast({
        message: "Avatar uploaded successfully",
        variant: "success",
      });

      // reset progress
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        message: "Upload failed",
        variant: "error",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }

    // reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // * remove avatar
  const handleRemoveAvatar = async () => {
    if (!user?.avatar_url) return;

    try {
      setIsUploading(true);

      // delete avatar from storage
      await deleteAvatarByUrl(user.avatar_url);

      // update user profile
      await updateProfileMutation.mutateAsync({
        avatar_url: null,
      });

      // show success toast
      toast({
        message: "Avatar removed successfully",
        variant: "success",
      });

      // reset progress
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error("Remove avatar error:", error);
      toast({
        message: "Remove avatar failed",
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // * trigger file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-6">
        {/* Avatar Display */}
        <div className="relative">
          <Avatar variant="primary" className="w-24 h-24">
            {user?.avatar_url ? (
              <Avatar.Image
                src={user.avatar_url}
                alt={user.full_name || "User avatar"}
              />
            ) : (
              <Avatar.Fallback className="bg-pink-200 text-pink-800 text-2xl">
                {user?.full_name
                  ? user.full_name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || (
                      <User className="h-8 w-8" />
                    )}
              </Avatar.Fallback>
            )}
          </Avatar>

          {/* Upload Overlay */}
          {!isUploading && (
            <button
              onClick={triggerFileInput}
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              title="Change avatar"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <Text
              as="h4"
              className="font-bold font-pixel text-black dark:text-white mb-1"
            >
              Profile Picture
            </Text>
            <Text
              as="p"
              className="text-sm text-gray-600 dark:text-gray-300 font-pixel"
            >
              Upload a photo to personalize your profile
            </Text>
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Text
                  as="span"
                  className="text-sm font-pixel text-black dark:text-white"
                >
                  {uploadProgress === 100 ? "Upload complete!" : "Uploading..."}
                </Text>
                <Text
                  as="span"
                  className="text-sm font-pixel text-black dark:text-white"
                >
                  {Math.round(uploadProgress)}%
                </Text>
              </div>
              <Progress value={uploadProgress} max={100} />
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>

              {user?.avatar_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          )}

          <Text
            as="p"
            className="text-xs text-gray-500 dark:text-gray-400 font-pixel"
          >
            Supports JPEG, PNG, GIF, WebP. Max size: 5MB
          </Text>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
