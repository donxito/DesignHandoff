"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Shield, Bell, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/retroui/Card";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const settingsNavItems = [
  {
    label: "Profile",
    href: "/dashboard/settings/profile",
    icon: User,
    description: "Manage your profile information",
  },
  {
    label: "Account",
    href: "/dashboard/settings/account",
    icon: Shield,
    description: "Security and account settings",
  },
  {
    label: "Notifications",
    href: "/dashboard/settings/notifications",
    icon: Bell,
    description: "Email and push notifications",
    disabled: true, // TODO: Implement notifications
  },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Settings Navigation */}
      <div className="lg:w-64 flex-shrink-0">
        <Card className="p-4 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
          <h3 className="font-bold font-pixel text-black dark:text-white mb-4">
            Settings
          </h3>

          <nav className="space-y-2">
            {settingsNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <div key={item.href}>
                  {item.disabled ? (
                    <div className="flex items-center px-3 py-2 rounded-lg text-gray-400 dark:text-gray-600 cursor-not-allowed">
                      <Icon className="h-4 w-4 mr-3" />
                      <div>
                        <span className="font-pixel text-sm">{item.label}</span>
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                          Coming soon
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Link href={item.href} className="no-underline">
                      <div
                        className={cn(
                          "flex items-center px-3 py-2 rounded-lg transition-all",
                          "border-2 border-black dark:border-white",
                          isActive
                            ? "bg-black dark:bg-white shadow-none translate-x-[2px] translate-y-[2px]"
                            : "bg-white dark:bg-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[1px] hover:translate-y-[1px]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 mr-3",
                            isActive
                              ? "text-white dark:text-black"
                              : "text-black dark:text-white"
                          )}
                        />
                        <div>
                          <span
                            className={cn(
                              "font-pixel text-sm",
                              isActive
                                ? "text-white dark:text-black"
                                : "text-black dark:text-white"
                            )}
                          >
                            {item.label}
                          </span>
                          <p
                            className={cn(
                              "text-xs",
                              isActive
                                ? "text-white/70 dark:text-black/70"
                                : "text-gray-500 dark:text-gray-400"
                            )}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-pixel text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Changes are saved automatically
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
