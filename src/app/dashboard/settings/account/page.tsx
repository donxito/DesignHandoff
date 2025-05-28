"use client";

import AccountSettings from "@/components/settings/account-settings";
import { Text } from "@/components/retroui/Text";

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Text
          as="h1"
          className="text-2xl font-bold font-pixel text-black dark:text-white mb-2"
        >
          Account Settings
        </Text>
        <Text as="p" className="text-gray-600 dark:text-gray-300 font-pixel">
          Manage your account security and preferences
        </Text>
      </div>

      <AccountSettings />
    </div>
  );
}
