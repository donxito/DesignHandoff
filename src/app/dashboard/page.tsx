"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import DashboardContent from "./dashboard-content";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <DashboardContent />
    </DashboardLayout>
  );
}
