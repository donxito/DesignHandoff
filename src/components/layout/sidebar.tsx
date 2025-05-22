"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, FolderKanban, Upload, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/retroui/Text";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    label: "Upload Files",
    href: "/dashboard/upload",
    icon: Upload,
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 md:min-h-[calc(100vh-5rem)] border-r-3 border-black dark:border-white md:pr-6">
      <nav className="sticky top-24 space-y-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="no-underline"
            >
              <div
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg transition-all",
                  "border-3 border-black dark:border-white",
                  isActive
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-none translate-x-[2px] translate-y-[2px]"
                    : "bg-white dark:bg-gray-900 text-black dark:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[2px] hover:translate-y-[2px]"
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                <Text as="span" className="font-pixel">
                  {item.label}
                </Text>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
