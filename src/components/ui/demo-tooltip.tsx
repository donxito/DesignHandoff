"use client";

import { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";

interface DemoTooltipProps {
  children: React.ReactNode;
  content: string;
  title?: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  triggerOnce?: boolean;
  className?: string;
}

export function DemoTooltip({
  children,
  content,
  title = "💡 Demo Tip",
  position = "top",
  delay = 1000,
  triggerOnce = true,
  className = "",
}: DemoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if tooltip was already shown (using localStorage)
    const tooltipKey = `demo-tooltip-${content.slice(0, 20)}`;
    const wasShown = localStorage.getItem(tooltipKey);

    if (triggerOnce && wasShown) {
      setHasBeenShown(true);
      return;
    }

    // Show tooltip after delay
    const timer = setTimeout(() => {
      if (!hasBeenShown) {
        setIsVisible(true);
        if (triggerOnce) {
          localStorage.setItem(tooltipKey, "true");
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [content, delay, triggerOnce, hasBeenShown]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenShown(true);
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-blue-600";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-blue-600";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-blue-600";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-blue-600";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-blue-600";
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {children}

      {isVisible && !hasBeenShown && (
        <div
          className={`absolute z-50 ${getPositionClasses()} animate-in fade-in duration-300`}
          role="tooltip"
        >
          {/* Tooltip Content */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg border-2 border-blue-700 max-w-xs min-w-[200px]">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-pixel text-sm font-bold mb-1">{title}</div>
                <div className="font-pixel text-xs text-blue-100 leading-relaxed">
                  {content}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-blue-200 hover:text-white transition-colors p-0.5"
                aria-label="Close tooltip"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
              style={{
                borderWidth: "6px",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Preset tooltips for common demo scenarios
export const DemoTooltips = {
  ProjectsPage: (children: React.ReactNode) => (
    <DemoTooltip
      content="Click 'Create Project' to see the project creation flow, or explore existing sample projects to view design files and collaboration features."
      title="🎯 Projects Demo"
      position="bottom"
      delay={2000}
    >
      {children}
    </DemoTooltip>
  ),

  FileUpload: (children: React.ReactNode) => (
    <DemoTooltip
      content="Try uploading a design file to see automatic spec extraction in action. Supported formats: PNG, JPG, WebP, PDF."
      title="📁 File Upload"
      position="right"
      delay={1500}
    >
      {children}
    </DemoTooltip>
  ),

  DesignSpecs: (children: React.ReactNode) => (
    <DemoTooltip
      content="This showcases automatic color palette and typography extraction from design files - a key technical achievement of this platform."
      title="🎨 Spec Extraction"
      position="top"
      delay={1000}
    >
      {children}
    </DemoTooltip>
  ),

  RealTimeComments: (children: React.ReactNode) => (
    <DemoTooltip
      content="Comments update in real-time across all users. Try adding a comment to see the live collaboration feature in action."
      title="💬 Real-time Collaboration"
      position="left"
      delay={2500}
    >
      {children}
    </DemoTooltip>
  ),

  TeamManagement: (children: React.ReactNode) => (
    <DemoTooltip
      content="Invite team members and manage permissions. Email integration powered by Resend API for seamless collaboration."
      title="👥 Team Features"
      position="bottom"
      delay={2000}
    >
      {children}
    </DemoTooltip>
  ),
};

// Hook to disable all demo tooltips (for users who don't want them)
export function useDemoTooltips() {
  const disableAllTooltips = () => {
    const keys = [
      "demo-tooltip-Click 'Create Project'",
      "demo-tooltip-Try uploading a design",
      "demo-tooltip-This showcases automatic",
      "demo-tooltip-Comments update in real",
      "demo-tooltip-Invite team members and",
    ];

    keys.forEach((key) => {
      localStorage.setItem(key, "true");
    });
  };

  const enableAllTooltips = () => {
    const keys = [
      "demo-tooltip-Click 'Create Project'",
      "demo-tooltip-Try uploading a design",
      "demo-tooltip-This showcases automatic",
      "demo-tooltip-Comments update in real",
      "demo-tooltip-Invite team members and",
    ];

    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  };

  return { disableAllTooltips, enableAllTooltips };
}
