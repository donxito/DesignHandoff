"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import SettingsLayout from "@/components/layout/settings-layout";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayoutPage({ children }: SettingsLayoutProps) {
  return (
    <DashboardLayout title="Settings">
      <SettingsLayout>{children}</SettingsLayout>
    </DashboardLayout>
  );
}
