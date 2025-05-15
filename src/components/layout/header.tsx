"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import ThemeToggle from "./theme-toggle";

// Import RetroUI components
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b-3 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] relative z-10">
      {/* Decorative accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="no-underline flex items-center group">
              <div className="w-10 h-10 bg-pink-500 border-3 border-black rounded-full flex items-center justify-center mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <Text as="h1" className="text-black dark:text-white text-2xl font-bold tracking-tight">
                DesignHandoff
              </Text>
            </Link>
          </div>

          <nav className="flex items-center space-x-6">
            <ThemeToggle />

            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/dashboard" className="no-underline">
                    <Button variant="secondary" size="sm" className="font-medium">
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="font-medium"
                  >
                    Logout
                  </Button>
                </div>
                <Avatar variant="primary" className="cursor-pointer transition-all hover:scale-105">
                  <div className="flex items-center justify-center w-full h-full bg-pink-200 text-black font-bold">
                    {user.email ? user.email.charAt(0).toUpperCase() : "?"}
                  </div>
                </Avatar>
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
