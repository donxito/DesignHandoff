import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Theme
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  // Sidebar (for dashboard layout)
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

type Notification = {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme state
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      // Sidebar state
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== id
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "design-handoff-ui-storage", // Name for localStorage
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }), // Only persist these properties
    }
  )
);
