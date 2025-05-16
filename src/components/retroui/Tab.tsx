import { cn } from "@/lib/utils";
import React, { HTMLAttributes, createContext, useContext, useState } from "react";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultTab?: string;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, children, defaultTab, ...props }, ref) => {
    const [activeTab, setActiveTab] = useState(defaultTab || "");

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        <div
          ref={ref}
          className={cn("flex flex-col gap-4", className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = "Tabs";

const TabList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex border-b-4 border-neutral-900 dark:border-white",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabList.displayName = "TabList";

export interface TabTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabTrigger = React.forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) {
      throw new Error("TabTrigger must be used within a Tabs component");
    }

    const { activeTab, setActiveTab } = context;
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        className={cn(
          "px-4 py-2 font-pixel transition-all border-b-4 -mb-1",
          isActive
            ? "border-primary bg-primary text-neutral-900"
            : "border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800",
          className
        )}
        onClick={() => setActiveTab(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabTrigger.displayName = "TabTrigger";

export interface TabContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabContent = React.forwardRef<HTMLDivElement, TabContentProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) {
      throw new Error("TabContent must be used within a Tabs component");
    }

    const { activeTab } = context;
    const isActive = activeTab === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        className={cn("py-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabContent.displayName = "TabContent";

export { Tabs, TabList, TabTrigger, TabContent };
