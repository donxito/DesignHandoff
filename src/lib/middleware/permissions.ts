import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import {
  ProjectRole,
  LegacyRole,
  Permission,
  hasPermission,
} from "@/lib/types/team";

export interface AuthContext {
  user: {
    id: string;
    email: string;
  };
  projectRole?: ProjectRole | LegacyRole;
  projectId?: string;
}

// * Verify user authentication and get user context
export async function getAuthContext(
  request: NextRequest
): Promise<AuthContext | null> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email!,
      },
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

// * Get user's role in a specific project
export async function getUserProjectRole(
  userId: string,
  projectId: string
): Promise<ProjectRole | LegacyRole | null> {
  try {
    // Check if user is project owner
    const { data: project } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .single();

    if (project?.owner_id === userId) {
      return "owner";
    }

    // Check project membership - note: your schema uses auth.users, not profiles
    const { data: member } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    return (member?.role as ProjectRole | LegacyRole) || null;
  } catch (error) {
    console.error("Error getting user project role:", error);
    return null;
  }
}

// * Check if user has specific permission for a project
export async function checkProjectPermission(
  userId: string,
  projectId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getUserProjectRole(userId, projectId);

  if (!role) {
    return false;
  }

  return hasPermission(role, permission);
}

// * Middleware to enforce authentication
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const authContext = await getAuthContext(request);

  if (!authContext) {
    throw new Error("Authentication required");
  }

  return authContext;
}

// * Middleware to enforce project access
export async function requireProjectAccess(
  request: NextRequest,
  projectId: string,
  permission?: Permission
): Promise<AuthContext & { projectRole: ProjectRole | LegacyRole }> {
  const authContext = await requireAuth(request);

  const projectRole = await getUserProjectRole(authContext.user.id, projectId);

  if (!projectRole) {
    throw new Error("Project access denied");
  }

  if (permission && !hasPermission(projectRole, permission)) {
    throw new Error(`Permission '${permission}' required`);
  }

  return {
    ...authContext,
    projectRole,
    projectId,
  };
}

// * Middleware to enforce project ownership or admin access
export async function requireProjectAdmin(
  request: NextRequest,
  projectId: string
): Promise<AuthContext & { projectRole: ProjectRole | LegacyRole }> {
  return requireProjectAccess(request, projectId, "invite_members");
}

// * Check if user can modify another user's role/membership
export async function canModifyUser(
  currentUserId: string,
  projectId: string,
  targetUserId: string,
  action: "remove" | "change_role"
): Promise<{ allowed: boolean; reason?: string }> {
  const currentUserRole = await getUserProjectRole(currentUserId, projectId);
  const targetUserRole = await getUserProjectRole(targetUserId, projectId);

  if (!currentUserRole) {
    return { allowed: false, reason: "No project access" };
  }

  if (!targetUserRole) {
    return { allowed: false, reason: "Target user not in project" };
  }

  // Can't modify yourself
  if (currentUserId === targetUserId) {
    return { allowed: false, reason: "Cannot modify your own membership" };
  }

  // Can't modify project owner
  if (targetUserRole === "owner") {
    return { allowed: false, reason: "Cannot modify project owner" };
  }

  // Check if user has permission for the action
  const requiredPermission =
    action === "remove" ? "remove_members" : "change_roles";
  if (!hasPermission(currentUserRole, requiredPermission)) {
    return {
      allowed: false,
      reason: `Permission '${requiredPermission}' required`,
    };
  }

  // Users can only modify members with lower hierarchy
  const { ROLE_HIERARCHY, normalizeRole } = await import("@/lib/types/team");
  const normalizedCurrentRole = normalizeRole(currentUserRole);
  const normalizedTargetRole = normalizeRole(targetUserRole);

  if (
    ROLE_HIERARCHY[normalizedCurrentRole] <=
    ROLE_HIERARCHY[normalizedTargetRole]
  ) {
    return {
      allowed: false,
      reason: "Insufficient permissions for target user role",
    };
  }

  return { allowed: true };
}

// * Error response helper for API routes
export function createErrorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

// * Success response helper for API routes
export function createSuccessResponse<T = unknown>(
  data: T,
  status: number = 200
) {
  return Response.json({ success: true, data }, { status });
}
