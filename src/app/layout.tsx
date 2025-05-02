import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DesignHandoff - Bridge the gap between Design and Development",
    template: "%s | DesignHandoff",
  },
  description:
    "DesignHandoff helps teams collaborate seamlessly by providing developers with accurate specifications, assets, and code snippets directly from design files.",
  keywords: [
    "design",
    "development",
    "handoff",
    "collaboration",
    "UI",
    "UX",
    "design system",
  ],
  authors: [{ name: "DesignHandoff Team" }],
  creator: "DesignHandoff",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6", // Blue-600
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
