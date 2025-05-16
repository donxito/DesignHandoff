"use client";

import { useState } from "react";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import FeatureCard from "@/components/home/ui/FeatureCard";
import FeatureVisual from "@/components/home/ui/FeatureVisual";

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  // * Features data
  const features = [
    {
      title: "Design File Management",
      description:
        "Upload, organize, and share design files with your development team in one central location. Supports multiple file formats.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      ),
      color: "pink",
    },
    {
      title: "Design Specifications",
      description:
        "Extract and view detailed design specs, measurements, and styles to ensure pixel-perfect implementation every time.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
      ),
      color: "blue",
    },
    {
      title: "Asset Management",
      description:
        "Automatically extract and organize design assets for easy access by developers. Includes versioning and history.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
          />
        </svg>
      ),
      color: "yellow",
    },
  ];

  return (
    <section className="relative z-10 py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 to-blue-100/30 dark:from-pink-900/20 dark:to-blue-900/20 transform -skew-y-6 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="primary" className="mb-4 inline-block">
            Powerful Features
          </Badge>
          <Text
            as="h2"
            className="text-4xl md:text-5xl font-bold mb-6 font-pixel text-black dark:text-white"
          >
            A{" "}
            <span className="text-pink-500 dark:text-pink-400">
              Retro Interface
            </span>{" "}
            for{" "}
            <span className="text-blue-500 dark:text-blue-400">
              Modern Problems
            </span>
          </Text>
        </div>

        {/* Interactive Feature Selector */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {features.map((feature, index) => (
              <button
                key={index}
                className={`px-4 py-2 border-4 font-pixel rounded-md transition-all transform ${
                  activeFeature === index
                    ? `bg-${feature.color}-400 border-black text-black scale-110`
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                }`}
                onClick={() => setActiveFeature(index)}
                aria-pressed={activeFeature === index}
                aria-label={`Select ${feature.title} feature`}
              >
                {feature.title}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          {/* Feature description (left on mobile, left 2 cols on desktop) */}
          <div className="md:col-span-2 order-2 md:order-1">
            <FeatureCard
              feature={features[activeFeature]}
              activeFeature={activeFeature}
            />
          </div>

          {/* Feature visual (right on mobile, right 3 cols on desktop) */}
          <div className="md:col-span-3 order-1 md:order-2 relative">
            <FeatureVisual activeFeature={activeFeature} features={features} />
          </div>
        </div>
      </div>
    </section>
  );
}
