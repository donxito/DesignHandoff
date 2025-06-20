/**
 * Auth utility functions for handling URLs and callbacks
 */

/**
 * Get the appropriate site URL for auth callbacks
 * Works for both client and server-side rendering
 */
export function getSiteUrl(): string {
  // Check for environment variable first (production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // For client-side, use window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Fallback for server-side rendering
  return "http://localhost:3000";
}

/**
 * Generate auth callback URL
 */
export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}

/**
 * Generate password reset callback URL
 */
export function getPasswordResetUrl(): string {
  return `${getSiteUrl()}/auth/reset-password`;
}

/**
 * Check if current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if current environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}
