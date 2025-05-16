"use client";

import Header from "@/components/layout/header";
import FileUploadDemo from "./file-upload-demo";
import Link from "next/link";

// RetroUI components
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/retroui/Breadcrumb";
import { Button } from "@/components/retroui/Button";

/**
 * Upload content component that displays the file upload UI
 * Uses client-side auth context for user information
 */
export default function UploadContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')]">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbItem>
              <Link
                href="/dashboard"
                className="hover:underline text-black dark:text-white text-adaptive"
              >
                Dashboard
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem
              active
              className="text-black dark:text-white text-adaptive"
            >
              Upload Files
            </BreadcrumbItem>
          </Breadcrumb>
        </div>

        <Text
          as="h1"
          className="text-3xl font-bold mb-6 font-pixel text-black dark:text-white text-adaptive"
        >
          Upload Files
        </Text>

        <Card className="max-w-xl mx-auto p-6 border-4 border-neutral-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] bg-white dark:bg-[#1e1e1e]">
          <FileUploadDemo />

          <div className="mt-6 flex justify-end">
            <Link href="/dashboard" className="no-underline">
              <Button
                variant="outline"
                className="font-pixel text-black dark:text-white"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
