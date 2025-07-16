"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import {
  ArrowLeft,
  Upload,
  Palette,
  MessageSquare,
  Download,
  Users,
  Eye,
  FileImage,
} from "lucide-react";

export default function DemoPage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] =
    useState<keyof typeof features>("upload");

  const features = {
    upload: {
      title: "Upload Design Files",
      icon: <Upload className="h-6 w-6" />,
      description: "Drag & drop your Figma, Sketch, or Adobe XD files",
      demo: (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
          <FileImage className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="font-pixel text-gray-600 dark:text-gray-400 mb-4">
            Drop your design files here
          </p>
          <Button variant="secondary" size="sm">
            Browse Files
          </Button>
        </div>
      ),
    },
    specs: {
      title: "Extract Specifications",
      icon: <Palette className="h-6 w-6" />,
      description: "Automatically extract colors, fonts, and measurements",
      demo: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-500 h-12 rounded flex items-center justify-center text-white font-pixel text-sm">
              #3B82F6
            </div>
            <div className="bg-green-500 h-12 rounded flex items-center justify-center text-white font-pixel text-sm">
              #10B981
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
            <p className="font-pixel text-sm">Font: Inter, 16px, 400</p>
            <p className="font-pixel text-sm">Spacing: 24px margin</p>
          </div>
        </div>
      ),
    },
    comments: {
      title: "Real-time Comments",
      icon: <MessageSquare className="h-6 w-6" />,
      description: "Leave feedback and collaborate with your team",
      demo: (
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded border-l-4 border-blue-500">
            <p className="font-pixel text-sm font-bold">Sarah (Designer)</p>
            <p className="text-sm">Can we increase the button padding?</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded border-l-4 border-green-500">
            <p className="font-pixel text-sm font-bold">Mike (Developer)</p>
            <p className="text-sm">Updated! Check the latest version.</p>
          </div>
        </div>
      ),
    },
    export: {
      title: "Export Assets",
      icon: <Download className="h-6 w-6" />,
      description: "Download optimized assets and code snippets",
      demo: (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <span className="font-pixel text-sm">icon-home.svg</span>
            <Button variant="secondary" size="sm">
              Download
            </Button>
          </div>
          <div className="bg-gray-900 p-3 rounded text-green-400 font-mono text-xs">
            .button {"{"}
            <br />
            &nbsp;&nbsp;background: #3B82F6;
            <br />
            &nbsp;&nbsp;padding: 12px 24px;
            <br />
            &nbsp;&nbsp;border-radius: 6px;
            <br />
            {"}"}
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      {/* Header */}
      <header className="border-b-2 border-black dark:border-white bg-white dark:bg-[#1e1e1e] p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="secondary"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="font-pixel text-xl font-bold text-black dark:text-white">
              DesignHandoff Demo
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/auth/login")}
              variant="secondary"
            >
              Sign In
            </Button>
            <Button
              onClick={() => router.push("/auth/signup")}
              variant="primary"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="warning" className="mb-4">
            <Eye className="h-4 w-4 mr-2" />
            Interactive Demo
          </Badge>
          <h2 className="font-pixel text-3xl font-bold text-black dark:text-white mb-4">
            Experience DesignHandoff in Action
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Click on any feature below to see how it works. This is a preview of
            the actual platform.
          </p>
        </div>

        {/* Feature Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(features).map(([key, feature]) => (
            <button
              key={key}
              onClick={() => setActiveFeature(key as keyof typeof features)}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeFeature === key
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`${activeFeature === key ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}
                >
                  {feature.icon}
                </div>
                <span className="font-pixel text-sm font-bold text-black dark:text-white">
                  {feature.title}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Active Feature Demo */}
        <Card className="max-w-4xl mx-auto p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-blue-600 dark:text-blue-400">
                  {features[activeFeature].icon}
                </div>
                <h3 className="font-pixel text-xl font-bold text-black dark:text-white">
                  {features[activeFeature].title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {features[activeFeature].description}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/auth/signup")}
                  variant="primary"
                >
                  Try This Feature
                </Button>
                <Button onClick={() => router.push("/")} variant="secondary">
                  Learn More
                </Button>
              </div>
            </div>
            <div>{features[activeFeature].demo}</div>
          </div>
        </Card>

        {/* Sample Projects Preview */}
        <div className="mt-16 text-center">
          <h3 className="font-pixel text-2xl font-bold text-black dark:text-white mb-8">
            Sample Projects
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Mobile App Design",
                files: 12,
                team: 4,
                status: "Active",
              },
              { name: "Website Redesign", files: 8, team: 3, status: "Review" },
              {
                name: "Brand Guidelines",
                files: 15,
                team: 2,
                status: "Complete",
              },
            ].map((project, i) => (
              <Card key={i} className="p-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-pixel font-bold text-black dark:text-white">
                    {project.name}
                  </h4>
                  <Badge
                    variant={
                      project.status === "Active"
                        ? "primary"
                        : project.status === "Review"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    {project.files} files
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {project.team} team members
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-blue-50 dark:bg-blue-900/30 p-8 rounded-lg">
          <h3 className="font-pixel text-2xl font-bold text-black dark:text-white mb-4">
            Ready to streamline your design workflow?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Join teams who have improved their design-to-development handoff
            process with DesignHandoff.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/auth/signup")}
              variant="primary"
              size="lg"
            >
              Start Free Trial
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="secondary"
              size="lg"
            >
              Back to Homepage
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
