"use client";

import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Bell, Clock } from "lucide-react";

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Text
          as="h1"
          className="text-2xl font-bold font-pixel text-black dark:text-white mb-2"
        >
          Notification Settings
        </Text>
        <Text as="p" className="text-gray-600 dark:text-gray-300 font-pixel">
          Configure how you receive notifications
        </Text>
      </div>

      <Card className="p-8 text-center border-dashed border-gray-300 dark:border-gray-700">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Text
              as="h3"
              className="text-xl font-semibold font-pixel text-black dark:text-white"
            >
              Coming Soon
            </Text>
            <Badge variant="warning" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              In Development
            </Badge>
          </div>

          <Text
            as="p"
            className="mb-6 font-pixel text-gray-600 dark:text-gray-300"
          >
            Notification preferences and email settings will be available in a
            future update.
          </Text>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Text
              as="p"
              className="text-sm font-pixel text-blue-800 dark:text-blue-200"
            >
              <strong>Coming features:</strong>
              <br />
              • Email notifications for project updates
              <br />
              • Comment and mention notifications
              <br />
              • File upload notifications
              <br />• Team invitation alerts
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
