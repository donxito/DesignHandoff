import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { ReactPlugin } from "@stagewise-plugins/react";

// Load Inter font for body text
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DesignHandoff",
  description:
    "A platform that bridges the gap between designers and developers",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${inter.variable} font-sans antialiased bg-white dark:bg-gray-900 bg-grid-pattern text-black dark:text-white`}
        suppressHydrationWarning={true}
      >
        {/* Only render StagewiseToolbar in development mode */}
        {process.env.NODE_ENV === "development" && (
          <StagewiseToolbar
            config={{
              plugins: [ReactPlugin],
            }}
          />
        )}
        <Providers>
          {/* Main content area with grid pattern background */}
          <main className="flex-1 bg-line-grid">
            <div className="bg-white/80 dark:bg-gray-900/80 min-h-full">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
