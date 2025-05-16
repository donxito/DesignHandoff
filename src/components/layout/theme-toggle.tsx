"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/retroui/Button";
import { useUIStore } from "@/lib/store";

export default function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);

  // * Initialize theme on mount
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Set initial theme state
    const initialIsDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    // Apply theme to document
    if (initialIsDark) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }

    setMounted(true);

    // Log initial theme state
    console.log("Initial theme:", initialIsDark ? "dark" : "light");
  }, [setTheme]);

  // * Function to apply dark mode styles to specific elements
  const applyDarkModeStyles = () => {
    // CSS variables for dark mode
    const darkModeVars = {
      bgPrimary: "#121212",
      bgSecondary: "#1e1e1e",
      bgTertiary: "#2a2a2a",
      textPrimary: "#f8f9fa",
      textSecondary: "#e9ecef",
      border: "#ffffff",
    };

    // Apply CSS variables to the root element
    document.documentElement.style.setProperty(
      "--bg-primary",
      darkModeVars.bgPrimary
    );
    document.documentElement.style.setProperty(
      "--bg-secondary",
      darkModeVars.bgSecondary
    );
    document.documentElement.style.setProperty(
      "--bg-tertiary",
      darkModeVars.bgTertiary
    );
    document.documentElement.style.setProperty(
      "--text-primary",
      darkModeVars.textPrimary
    );
    document.documentElement.style.setProperty(
      "--text-secondary",
      darkModeVars.textSecondary
    );
    document.documentElement.style.setProperty(
      "--border-color",
      darkModeVars.border
    );

    // Add a class to handle the transition
    document.documentElement.classList.add("theme-transition");

    // Apply the dark class to all elements that need it
    document.querySelectorAll(".text-adaptive").forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.color = darkModeVars.textPrimary;
      }
    });

    // Handle white text that would be invisible in light mode
    document.querySelectorAll(".text-white").forEach((el) => {
      if (el instanceof HTMLElement) {
        el.dataset.originalColor = "white"; // Store original color for toggling back
      }
    });

    // Handle SVG icons with white or black fill
    document.querySelectorAll('svg[fill="white"]').forEach((svg) => {
      svg.setAttribute("data-original-fill", "white");
      svg.setAttribute("fill", darkModeVars.textPrimary);
    });

    document.querySelectorAll('svg[fill="black"]').forEach((svg) => {
      svg.setAttribute("data-original-fill", "black");
      svg.setAttribute("fill", darkModeVars.textPrimary);
    });

    // Handle specific background classes that don't respond to CSS variables
    document
      .querySelectorAll(
        '.bg-white, .bg-neutral-100, .bg-neutral-200, [class*="bg-[#f5f5f5]"]'
      )
      .forEach((el) => {
        if (el instanceof HTMLElement) {
          el.dataset.originalBg = el.style.backgroundColor || "white";
          el.style.backgroundColor = darkModeVars.bgPrimary;
        }
      });

    // Remove the transition class after a delay to avoid transition on initial load
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 500);
  };

  // * Function to reset styles for light mode
  const resetLightModeStyles = () => {
    // Define CSS variables for light mode
    const lightModeVars = {
      bgPrimary: "white",
      bgSecondary: "#f8f9fa",
      bgTertiary: "#e9ecef",
      textPrimary: "#212529",
      textSecondary: "#495057",
      border: "#000000",
    };

    // Apply CSS variables to the root element
    document.documentElement.style.setProperty(
      "--bg-primary",
      lightModeVars.bgPrimary
    );
    document.documentElement.style.setProperty(
      "--bg-secondary",
      lightModeVars.bgSecondary
    );
    document.documentElement.style.setProperty(
      "--bg-tertiary",
      lightModeVars.bgTertiary
    );
    document.documentElement.style.setProperty(
      "--text-primary",
      lightModeVars.textPrimary
    );
    document.documentElement.style.setProperty(
      "--text-secondary",
      lightModeVars.textSecondary
    );
    document.documentElement.style.setProperty(
      "--border-color",
      lightModeVars.border
    );

    // Add a class to handle the transition
    document.documentElement.classList.add("theme-transition");

    // Apply the light class to all elements that need it
    document.querySelectorAll(".text-adaptive").forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.color = lightModeVars.textPrimary;
      }
    });

    // Handle white text that would be invisible in light mode
    document.querySelectorAll(".text-white").forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.color = lightModeVars.textPrimary;
      }
    });

    // Handle SVG icons with white or black fill
    document
      .querySelectorAll('svg[data-original-fill="white"], svg[fill="white"]')
      .forEach((svg) => {
        svg.setAttribute("fill", lightModeVars.textPrimary);
      });

    document
      .querySelectorAll('svg[data-original-fill="black"], svg[fill="black"]')
      .forEach((svg) => {
        svg.setAttribute("fill", lightModeVars.textPrimary);
      });

    // Reset background colors for elements that had them explicitly set
    document.querySelectorAll("[data-original-bg]").forEach((el) => {
      if (el instanceof HTMLElement) {
        const originalBg = el.dataset.originalBg || "";
        el.style.backgroundColor = originalBg === "white" ? "" : originalBg;
      }
    });

    // Remove the transition class after a delay
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 500);
  };

  // * Force a UI update when theme changes
  useEffect(() => {
    if (!mounted) return;

    // Apply theme class to document
    if (theme === "dark") {
      // Apply dark mode
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.style.colorScheme = "dark";

      // Apply dark mode to all elements that need specific handling
      applyDarkModeStyles();
    } else {
      // Apply light mode
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";

      // Reset styles for light mode
      resetLightModeStyles();
    }

    // Save preference to localStorage
    localStorage.setItem("theme", theme);

    // Log theme change
    console.log("Theme updated to:", theme);
  }, [theme, mounted]);

  // * Toggle theme function
  const handleToggleTheme = () => {
    toggleTheme();

    // Immediately apply the theme change to avoid waiting for the effect
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.style.colorScheme = "dark";
      applyDarkModeStyles();
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
      resetLightModeStyles();
    }
  };

  if (!mounted) {
    return null;
  }

  const isDarkMode = theme === "dark";

  return (
    <div className="relative">
      <Button
        onClick={handleToggleTheme}
        variant="outline"
        className={`
          w-14 h-14 flex items-center justify-center 
          border-3 ${isDarkMode ? "border-white bg-gray-800" : "border-black bg-white"} 
          rounded-full 
          ${
            isDarkMode
              ? "shadow-[3px_3px_0px_0px_rgba(248,249,250,0.7)]"
              : "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          } 
          hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] 
          dark:hover:shadow-[1px_1px_0px_0px_rgba(248,249,250,0.7)] 
          hover:translate-x-[2px] hover:translate-y-[2px] 
          transition-all duration-200
          retroui-button
        `}
        aria-label="Toggle dark mode"
        size="sm"
      >
        {isDarkMode ? (
          <div className="w-7 h-7 text-2xl text-yellow-400 animate-fadeIn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          </div>
        ) : (
          <div className="w-7 h-7 text-2xl text-blue-600 animate-fadeIn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </Button>
    </div>
  );
}
