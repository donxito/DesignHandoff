"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Layout,
  Palette,
  Code,
  RefreshCw,
} from "lucide-react";

interface DashBoardLayoutProps {
  children: React.ReactNode;
}

export default function DashBoardLayout({ children }: DashBoardLayoutProps) {
  const pathname = usePathname(); // get the current pathname
  const router = useRouter(); // for client-side navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isLoading, hasHydrated } = useAuthStore(); // get user, signOut, isLoading, and hasHydrated from authStore

  // * close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // set initial state
    handleResize();

    // add event listener
    window.addEventListener("resize", handleResize);

    // remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // * close mobile sidebar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Redirect to /login if user is null, not loading, and store is hydrated
  useEffect(() => {
    if (hasHydrated && !isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, hasHydrated, router]);

  // * navigation items
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Projects",
      path: "/dashboard/projects",
      icon: <FolderOpen size={20} />,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: <Settings size={20} />,
    },
  ];

  const userRole = user?.role || "developer";
  const roleIcon =
    userRole === "designer" ? <Palette size={16} /> : <Code size={16} />;

  // Show loading spinner while auth is hydrating or loading
  if (!hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <span className="sr-only">Loading...</span>
        <RefreshCw className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 z-10 flex flex-col bg-white border-r shadow-sm transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-16"
        } ${isMobileMenuOpen ? "left-0" : "-left-64 md:left-0"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/dashboard" className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-md">
              <Layout size={20} />
            </div>
            {isSidebarOpen && (
              <span className="ml-3 text-xl font-bold">DesignHandoff</span>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:block p-2 rounded-md hover:bg-gray-100"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="block md:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-md ${
                  pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* User profile at bottom of sidebar */}
        <div className="p-4 border-t">
          <div
            className={`flex ${
              isSidebarOpen ? "items-start" : "justify-center"
            }`}
          >
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium uppercase">
                {user?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="font-medium text-sm">
                  {user?.username || user?.email?.split("@")[0]}
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  {roleIcon}
                  <span className="ml-1 capitalize">{userRole}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sign out button */}
          <button
            onClick={() => signOut()}
            className={`mt-4 flex items-center text-gray-700 hover:text-red-600 transition-colors ${
              isSidebarOpen ? "w-full px-3 py-2" : "justify-center w-full py-2"
            }`}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="ml-2">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-5 bg-black bg-opacity-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Content area */}
      <div
        className={`flex-1 flex flex-col ${
          isSidebarOpen ? "md:ml-64" : "md:ml-16"
        }`}
      >
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 bg-white border-b shadow-sm">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="block md:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className="md:hidden flex-1 text-center font-bold text-lg">
            DesignHandoff
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              {/* Additional header elements like notifications can go here */}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
