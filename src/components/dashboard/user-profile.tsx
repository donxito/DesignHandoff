"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Avatar } from "@/components/retroui/Avatar";
import { Alert } from "@/components/retroui/Alert";

export default function UserProfile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // * Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // TODO: Update user profile in Supabase DB ASAP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-xl p-6">
      <Card.Header>
        <Card.Title>Your Profile</Card.Title>
      </Card.Header>

      <Card.Content>
        {error && (
          <Alert status="error" className="mb-6">
            <Alert.Description>{error}</Alert.Description>
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
              {user?.email ? user.email.charAt(0).toUpperCase() : "?"}
            </div>
          </Avatar>

          <div>
            <Text as="h3" className="text-xl font-bold">
              {user?.user_metadata?.full_name || "User"}
            </Text>
            <Text as="p" className="text-gray-600 dark:text-gray-300">
              {user?.email}
            </Text>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
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
                {user?.user_metadata?.full_name || "Not set"}
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
