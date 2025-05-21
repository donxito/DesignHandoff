"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import DashboardContent from "./dashboard-content";
import ToastDemo from "@/components/dashboard/toast-demo";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <DashboardContent />
      {/* Toast demo section */}
      <div className="mt-6">
        <ToastDemo />
      </div>
    </DashboardLayout>
  );
}
