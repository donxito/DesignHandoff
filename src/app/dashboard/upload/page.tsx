"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import UploadContent from "./upload-content";

export default function UploadPage() {
  return (
    <DashboardLayout title="Upload Files">
      <UploadContent />
    </DashboardLayout>
  );
}
