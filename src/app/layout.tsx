import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Load Inter font for body text
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

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
      <head>
        {/* Add theme initialization script to prevent flash of wrong theme */}
        <script src="/theme-init.js" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
