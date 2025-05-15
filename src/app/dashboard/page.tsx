import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardContent from "./dashboard-content";

export default async function DashboardPage() {
  // Try server-side auth first
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    const { data } = await supabase.auth.getSession();

    // If no session, rely on client-side auth check
    if (!data.session) {
      return (
        <ProtectedRoute>
          <DashboardContent />
        </ProtectedRoute>
      );
    }

    // If we have a session server-side, render directly
    return <DashboardContent user={data.session.user} />;
  } catch (error) {
    console.error("Server auth error:", error);
    // Fall back to client-side auth on any server error
    return (
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    );
  }
}
