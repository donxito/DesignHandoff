"use client";

import UserProfile from "@/components/dashboard/user-profile";
import { Text } from "@/components/retroui/Text";

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Text
          as="h1"
          className="text-2xl font-bold font-pixel text-black dark:text-white mb-2"
        >
          Profile Settings
        </Text>
        <Text as="p" className="text-gray-600 dark:text-gray-300 font-pixel">
          Manage your profile information and avatar
        </Text>
      </div>

      <UserProfile />
    </div>
  );
}
