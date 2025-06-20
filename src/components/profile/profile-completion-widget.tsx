"use client";

import Link from "next/link";
import { useProfileCompletion } from "@/hooks/use-profile-completion";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Progress } from "@/components/retroui/Progress";
import {
  CheckCircle,
  Circle,
  User,
  Mail,
  Camera,
  ArrowRight,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";

interface ProfileCompletionWidgetProps {
  className?: string;
  variant?: "card" | "banner" | "compact";
  dismissible?: boolean;
}

export function ProfileCompletionWidget({
  className,
  variant = "card",
  dismissible = false,
}: ProfileCompletionWidgetProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { percentage, completedSteps, totalSteps, steps, nextStep } =
    useProfileCompletion();

  if (isDismissed || percentage === 100) return null;

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case "email":
        return Mail;
      case "full_name":
        return User;
      case "avatar":
        return Camera;
      default:
        return Circle;
    }
  };

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <Text
              as="span"
              className="text-sm font-pixel text-black dark:text-white"
            >
              {percentage}% Complete
            </Text>
            <Text as="p" className="text-xs text-gray-500 dark:text-gray-400">
              Profile setup
            </Text>
          </div>
        </div>
        {nextStep && (
          <Link
            href={nextStep.href || "/dashboard/settings/profile"}
            className="no-underline"
          >
            <Button variant="outline" size="sm" className="text-xs">
              Continue
            </Button>
          </Link>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`relative p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg ${className}`}
      >
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <Text
                as="h4"
                className="font-bold font-pixel text-blue-900 dark:text-blue-100"
              >
                Complete Your Profile
              </Text>
              <Text
                as="p"
                className="text-sm font-pixel text-blue-700 dark:text-blue-300"
              >
                {completedSteps} of {totalSteps} steps completed ({percentage}%)
              </Text>
            </div>
          </div>

          {nextStep && (
            <Link
              href={nextStep.href || "/dashboard/settings/profile"}
              className="no-underline"
            >
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
              >
                {nextStep.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`p-6 border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <Text
              as="h4"
              className="font-bold font-pixel text-black dark:text-white"
            >
              Profile Setup
            </Text>
            <Text as="p" className="text-sm text-gray-600 dark:text-gray-300">
              {completedSteps} of {totalSteps} completed
            </Text>
          </div>
        </div>

        <Badge variant="primary" className="text-lg px-3 py-1">
          {percentage}%
        </Badge>
      </div>

      <div className="mb-4">
        <Progress value={percentage} />
      </div>

      <div className="space-y-3 mb-6">
        {steps.map((step) => {
          const Icon = getStepIcon(step.id);

          return (
            <div
              key={step.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed
                    ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1">
                <Text
                  as="span"
                  className={`text-sm font-pixel ${
                    step.completed
                      ? "text-green-800 dark:text-green-200"
                      : "text-black dark:text-white"
                  }`}
                >
                  {step.label}
                </Text>
                <Text
                  as="p"
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  {step.description}
                </Text>
              </div>

              {step.completed && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          );
        })}
      </div>

      {nextStep && (
        <Link
          href={nextStep.href || "/dashboard/settings/profile"}
          className="no-underline"
        >
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
          >
            Complete {nextStep.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </Card>
  );
}
