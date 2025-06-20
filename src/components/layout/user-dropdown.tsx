"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useAuthStore } from "@/lib/store";
import { useCurrentUser } from "@/hooks/use-users-query";
import { Avatar } from "@/components/retroui/Avatar";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { getAvatarUrl } from "@/lib/supabase/avatar-storage";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user: authUser, logout } = useAuthStore();
  const { data: user } = useCurrentUser();
  const router = useRouter();

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // * Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside the dropdown trigger button
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Also check if click is not on the portal dropdown content
        const dropdownContent = document.querySelector(
          "[data-dropdown-content]"
        );
        if (!dropdownContent || !dropdownContent.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      setIsOpen(false); // Close dropdown immediately
      const { error } = await logout();

      if (error) {
        console.warn("Logout completed with warning:", error.message);
        // Still navigate away since local state is cleared
      }

      // Force navigation to login page
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, navigate away since we cleared local state
      window.location.href = "/auth/login";
    }
  };

  // * Calculate profile completion
  const getProfileCompletion = () => {
    if (!user) return 0;

    let completed = 0;
    const total = 3;

    if (user.full_name) completed += 1;
    if (user.email) completed += 1;
    if (user.avatar_url) completed += 1;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = getProfileCompletion();
  const avatarUrl = user?.avatar_url ? getAvatarUrl(user.avatar_url) : null;

  if (!authUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Avatar variant="primary" className="w-10 h-10">
          {avatarUrl ? (
            <Avatar.Image
              src={avatarUrl}
              alt={user?.full_name || "User avatar"}
            />
          ) : (
            <Avatar.Fallback className="bg-pink-200 text-pink-800">
              {user?.full_name
                ? user.full_name.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() ||
                  authUser.email?.charAt(0).toUpperCase() ||
                  "?"}
            </Avatar.Fallback>
          )}
        </Avatar>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu - Using Portal */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            data-dropdown-content
            className="fixed w-80 bg-white dark:bg-gray-900 border-3 border-black dark:border-white rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)]"
            style={{
              position: "fixed",
              top: dropdownRef.current
                ? dropdownRef.current.getBoundingClientRect().bottom + 8
                : 0,
              right: dropdownRef.current
                ? window.innerWidth -
                  dropdownRef.current.getBoundingClientRect().right
                : 0,
              zIndex: 2147483646, // Just below dialog
            }}
            onClick={(e) => {
              // Prevent dropdown from closing when clicking inside
              e.stopPropagation();
            }}
          >
            {/* User Info Header */}
            <div className="p-4 border-b-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar variant="primary" className="w-12 h-12">
                  {avatarUrl ? (
                    <Avatar.Image
                      src={avatarUrl}
                      alt={user?.full_name || "User avatar"}
                    />
                  ) : (
                    <Avatar.Fallback className="bg-pink-200 text-pink-800">
                      {user?.full_name
                        ? user.full_name.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase() ||
                          authUser.email?.charAt(0).toUpperCase() ||
                          "?"}
                    </Avatar.Fallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <Text
                    as="h4"
                    className="font-bold font-pixel text-black dark:text-white truncate"
                  >
                    {user?.full_name || "User"}
                  </Text>
                  <Text
                    as="p"
                    className="text-sm text-gray-600 dark:text-gray-300 truncate"
                  >
                    {user?.email || authUser.email}
                  </Text>

                  {/* Profile Completion */}
                  <div className="flex items-center gap-2 mt-1">
                    {profileCompletion === 100 ? (
                      <Badge
                        variant="success"
                        className="flex items-center gap-1 text-xs"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Profile Complete
                      </Badge>
                    ) : (
                      <Badge
                        variant="warning"
                        className="flex items-center gap-1 text-xs"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {profileCompletion}% Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link href="/dashboard/settings/profile" className="no-underline">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <Text
                      as="span"
                      className="font-pixel text-black dark:text-white"
                    >
                      Profile Settings
                    </Text>
                    <Text
                      as="p"
                      className="text-xs text-gray-500 dark:text-gray-400"
                    >
                      Manage your profile
                    </Text>
                  </div>
                </button>
              </Link>

              <Link href="/dashboard/settings/account" className="no-underline">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4 text-gray-500" />
                  <div>
                    <Text
                      as="span"
                      className="font-pixel text-black dark:text-white"
                    >
                      Account Settings
                    </Text>
                    <Text
                      as="p"
                      className="text-xs text-gray-500 dark:text-gray-400"
                    >
                      Security & preferences
                    </Text>
                  </div>
                </button>
              </Link>

              <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Keep dropdown open during logout process
                  try {
                    const { error } = await logout();

                    if (error) {
                      console.warn(
                        "Logout completed with warning:",
                        error.message
                      );
                    }

                    // Clear any cached data
                    localStorage.clear();

                    // Navigate to login
                    window.location.href = "/auth/login";
                  } catch (error) {
                    console.error("Logout error:", error);
                    // Force logout anyway
                    localStorage.clear();
                    window.location.href = "/auth/login";
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <div>
                  <Text as="span" className="font-pixel">
                    Sign Out
                  </Text>
                  <Text as="p" className="text-xs">
                    Sign out of your account
                  </Text>
                </div>
              </button>
            </div>

            {/* Profile Completion Prompt */}
            {profileCompletion < 100 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 rounded-b-lg">
                <Text
                  as="p"
                  className="text-xs font-pixel text-blue-800 dark:text-blue-200 mb-2"
                >
                  Complete your profile for the best experience
                </Text>
                <Link
                  href="/dashboard/settings/profile"
                  className="no-underline"
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setIsOpen(false)}
                  >
                    Complete Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
