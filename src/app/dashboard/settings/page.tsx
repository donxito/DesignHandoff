"use client";

import { useState, useEffect } from "react";
import {
  User,
  KeyRound,
  Mail,
  UserCircle,
  Save,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function SettingsPage() {
  const { user, getUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    // Fetch the latest user data
    getUser();
  }, [getUser]);

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      const fetchProfileData = async () => {
        const supabase = createClient();

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("username, full_name")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          setUsername(data.username || "");
          setFullName(data.full_name || "");
        } catch (err) {
          console.error("Error fetching profile data:", err);
        }
      };

      fetchProfileData();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    const supabase = createClient();

    try {
      // Basic validation
      if (!username.trim()) {
        throw new Error("Username is required");
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          full_name: fullName.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess(true);

      // Refresh user data
      await getUser();
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Account Settings
        </h1>

        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          {/* Profile Section */}
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <User size={20} className="mr-2" />
              Profile Information
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircle size={16} className="text-gray-400" />
                    </div>
                    <Input
                      id="username"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    This will be your display name across the platform.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your email address is associated with your account and cannot
                  be changed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    disabled
                    className="w-full h-10 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed"
                  >
                    <option
                      value="designer"
                      selected={user?.role === "designer"}
                    >
                      Designer
                    </option>
                    <option
                      value="developer"
                      selected={user?.role === "developer"}
                    >
                      Developer
                    </option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your role was set during registration and determines your
                  default view.
                </p>
              </div>

              {/* Success message */}
              {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                  Profile updated successfully!
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Password Section */}
        <div className="mt-8 bg-white rounded-lg border overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <KeyRound size={20} className="mr-2" />
              Password
            </h2>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Password changes are managed through a secure process. Click the
              button below to receive a password reset email.
            </p>

            <Button
              variant="outline"
              onClick={() => {
                // This would trigger a password reset flow
                alert(
                  "This would send a password reset email (not implemented in this demo)"
                );
              }}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
