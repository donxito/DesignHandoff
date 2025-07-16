"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { initializeDemoData, hasDemoData } from "@/lib/utils/demo-data";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";

export function DemoInitializer() {
  const { user, isAuthenticated } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [demoDataExists, setDemoDataExists] = useState<boolean | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if demo data exists when component mounts
  useEffect(() => {
    async function checkDemoData() {
      if (user?.id) {
        try {
          const hasData = await hasDemoData(user.id);
          setDemoDataExists(hasData);
        } catch (error) {
          console.error("Error checking demo data:", error);
          setDemoDataExists(false);
        }
      }
    }

    if (isAuthenticated && user) {
      checkDemoData();
    }
  }, [user, isAuthenticated]);

  const handleInitializeDemoData = async () => {
    if (!user?.id) return;

    setIsInitializing(true);
    try {
      const result = await initializeDemoData(user.id);

      if (result.success) {
        setDemoDataExists(true);

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["projects"] });

        toast({
          message: "Demo data created!",
          description:
            "Sample projects have been added to showcase DesignHandoff features",
          variant: "success",
        });
      } else {
        toast({
          message: "Demo initialization failed",
          description:
            "There was an error creating demo data. Please try again.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error initializing demo data:", error);
      toast({
        message: "Demo initialization failed",
        description: "There was an error creating demo data. Please try again.",
        variant: "error",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Don't render if user is not authenticated or we're still checking
  if (!isAuthenticated || !user || demoDataExists === null) {
    return null;
  }

  // Don't render if demo data already exists
  if (demoDataExists) {
    return (
      <Card className="p-4 border-2 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <Text className="font-pixel text-green-800 dark:text-green-200 text-sm">
              Demo projects loaded! Explore sample designs and collaboration
              features.
            </Text>
          </div>
        </div>
      </Card>
    );
  }

  // Render demo initialization prompt
  return (
    <Card className="p-6 border-3 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 dark:bg-blue-400 rounded-lg flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Text
              as="h3"
              className="text-lg font-bold font-pixel text-blue-800 dark:text-blue-200"
            >
              Welcome to DesignHandoff!
            </Text>
            <Badge variant="secondary" className="text-xs">
              Portfolio Demo
            </Badge>
          </div>

          <Text className="text-blue-700 dark:text-blue-300 mb-4 font-pixel text-sm">
            Get started with sample projects to explore all features including
            design spec extraction, team collaboration, and real-time comments.
            Perfect for demonstrations!
          </Text>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Text className="text-blue-600 dark:text-blue-300">
                3 Sample Projects
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <Text className="text-blue-600 dark:text-blue-300">
                Design Files & Categories
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <Text className="text-blue-600 dark:text-blue-300">
                Team Collaboration
              </Text>
            </div>
          </div>

          <Button
            onClick={handleInitializeDemoData}
            disabled={isInitializing}
            className="bg-blue-500 hover:bg-blue-600 text-white font-pixel"
          >
            {isInitializing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Demo Data...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Load Sample Projects
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
