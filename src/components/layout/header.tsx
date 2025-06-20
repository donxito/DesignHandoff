"use client";

import Link from "next/link";
import ThemeToggle from "./theme-toggle";
import UserDropdown from "./user-dropdown";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/retroui/Button";

export default function Header() {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="bg-white dark:bg-gray-900 border-b-3 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] relative z-10">
      {/* Decorative bar */}
      <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500"></div>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="no-underline flex items-center group">
              <div className="w-10 h-10 bg-pink-500 border-3 border-black dark:border-white rounded-full flex items-center justify-center mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.5)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h1 className="text-black dark:text-white text-2xl font-bold tracking-tight">
                DesignHandoff
              </h1>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <Link href="/dashboard" className="no-underline">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="font-medium"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </div>
                <UserDropdown />
              </>
            ) : (
              <>
                <div className="hidden md:block">
                  <Link href="/auth/login" className="no-underline">
                    <Button variant="outline" size="sm" className="font-medium">
                      Login
                    </Button>
                  </Link>
                </div>
                <Link href="/auth/signup" className="no-underline">
                  <Button variant="primary" size="sm" className="font-medium">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
