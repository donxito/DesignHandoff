import { supabase } from "@/lib/supabase/client";

/**
 * API client that automatically includes authentication headers
 */
export class ApiClient {
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  static async get(url: string): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(url, {
      method: "GET",
      headers,
    });
  }

  static async post(url: string, data?: any): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(url, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put(url: string, data?: any): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(url, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete(url: string): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(url, {
      method: "DELETE",
      headers,
    });
  }
}

/**
 * Helper function to handle API responses
 */
export async function handleApiResponse<T = any>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.data || data;
}
