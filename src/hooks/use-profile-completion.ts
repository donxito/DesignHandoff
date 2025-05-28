"use client";

import { useMemo } from "react";
import { useCurrentUser } from "./use-users-query";

export interface ProfileCompletionStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  href?: string;
}

export interface ProfileCompletionData {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
  steps: ProfileCompletionStep[];
  nextStep?: ProfileCompletionStep;
}

// * Helper hook for checking if profile is complete
export function useIsProfileComplete(): boolean {
  const { percentage } = useProfileCompletion();
  return percentage === 100;
}

// * Helper hook for getting profile completion status
export function useProfileCompletionStatus():
  | "complete"
  | "incomplete"
  | "loading" {
  const { data: user, isLoading } = useCurrentUser();
  const { percentage } = useProfileCompletion();

  if (isLoading) return "loading";
  if (!user) return "incomplete";
  return percentage === 100 ? "complete" : "incomplete";
}

export function useProfileCompletion(): ProfileCompletionData {
  const { data: user } = useCurrentUser();

  const completionData = useMemo(() => {
    if (!user) {
      return {
        percentage: 0,
        completedSteps: 0,
        totalSteps: 0,
        steps: [],
      };
    }

    const steps: ProfileCompletionStep[] = [
      {
        id: "email",
        label: "Email Address",
        description: "Your email is verified and set",
        completed: !!user.email,
      },
      {
        id: "full_name",
        label: "Full Name",
        description: "Add your full name to personalize your profile",
        completed: !!user.full_name,
        href: "/dashboard/settings/profile",
      },
      {
        id: "avatar",
        label: "Profile Picture",
        description: "Upload a profile picture to represent yourself",
        completed: !!user.avatar_url,
        href: "/dashboard/settings/profile",
      },
    ];

    const completedSteps = steps.filter((step) => step.completed).length;
    const totalSteps = steps.length;
    const percentage = Math.round((completedSteps / totalSteps) * 100);
    const nextStep = steps.find((step) => !step.completed);

    return {
      percentage,
      completedSteps,
      totalSteps,
      steps,
      nextStep,
    };
  }, [user]);

  return completionData;
}
