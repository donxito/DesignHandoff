import { Database } from "./database";

export type DbProjectMember =
  Database["public"]["Tables"]["project_members"]["Row"];
export type DbProjectInvitation =
  Database["public"]["Tables"]["project_invitations"]["Row"];

export type ProjectRole = "owner" | "admin" | "member" | "viewer";

export type LegacyRole = "designer" | "developer" | "admin";

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export interface ProjectMember extends Omit<DbProjectMember, "role"> {
  role: ProjectRole | LegacyRole;
  user?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  invited_by_user?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

export interface ProjectInvitation extends DbProjectInvitation {
  status: InvitationStatus;
  invited_by_user?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
  project?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface InviteUserData {
  email: string;
  role: ProjectRole;
  message?: string;
}

export interface InviteUserResponse {
  success: boolean;
  invitation?: ProjectInvitation;
  error?: string;
}

export interface UpdateMemberRoleData {
  role: ProjectRole;
}

export interface AcceptInvitationData {
  token: string;
}

export interface ProjectMembersResponse {
  members: ProjectMember[];
  invitations: ProjectInvitation[];
  total: number;
  user_role?: ProjectRole | LegacyRole;
}

// Role hierarchy and permissions
export const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

// Legacy role mapping
export const LEGACY_ROLE_MAPPING: Record<LegacyRole, ProjectRole> = {
  admin: "admin",
  designer: "member",
  developer: "member",
};

export const ROLE_PERMISSIONS = {
  owner: [
    "invite_members",
    "remove_members",
    "change_roles",
    "delete_project",
    "edit_project",
    "upload_files",
    "delete_files",
    "comment",
    "view",
  ],
  admin: [
    "invite_members",
    "remove_members",
    "change_roles",
    "edit_project",
    "upload_files",
    "delete_files",
    "comment",
    "view",
  ],
  member: ["upload_files", "comment", "view"],
  viewer: ["view"],
} as const;

export type Permission =
  (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS][number];

// Role labels for UI
export const ROLE_LABELS: Record<ProjectRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export const LEGACY_ROLE_LABELS: Record<LegacyRole, string> = {
  admin: "Admin",
  designer: "Designer",
  developer: "Developer",
};

export const ROLE_DESCRIPTIONS: Record<ProjectRole, string> = {
  owner: "Full access to all project features and settings",
  admin: "Can manage team members and project settings",
  member: "Can upload files, comment, and collaborate",
  viewer: "Can view files and comments only",
};

// Helper functions
export function normalizeRole(role: ProjectRole | LegacyRole): ProjectRole {
  if (role in LEGACY_ROLE_MAPPING) {
    return LEGACY_ROLE_MAPPING[role as LegacyRole];
  }
  return role as ProjectRole;
}

export function hasPermission(
  userRole: ProjectRole | LegacyRole,
  permission: Permission
): boolean {
  const normalizedRole = normalizeRole(userRole);
  return (ROLE_PERMISSIONS[normalizedRole] as readonly Permission[]).includes(
    permission
  );
}

export function canChangeRole(
  currentUserRole: ProjectRole | LegacyRole,
  targetRole: ProjectRole
): boolean {
  const normalizedCurrentRole = normalizeRole(currentUserRole);
  return ROLE_HIERARCHY[normalizedCurrentRole] > ROLE_HIERARCHY[targetRole];
}

export function canRemoveMember(
  currentUserRole: ProjectRole | LegacyRole,
  targetUserRole: ProjectRole | LegacyRole
): boolean {
  const normalizedCurrentRole = normalizeRole(currentUserRole);
  const normalizedTargetRole = normalizeRole(targetUserRole);

  // Can't remove owner, can only remove members with lower hierarchy
  return (
    normalizedTargetRole !== "owner" &&
    ROLE_HIERARCHY[normalizedCurrentRole] > ROLE_HIERARCHY[normalizedTargetRole]
  );
}

export function getAvailableRoles(
  currentUserRole: ProjectRole | LegacyRole
): ProjectRole[] {
  const normalizedRole = normalizeRole(currentUserRole);
  const roles: ProjectRole[] = [];

  // Users can only assign roles lower than their own (except owner can assign admin)
  if (normalizedRole === "owner") {
    roles.push("admin", "member", "viewer");
  } else if (normalizedRole === "admin") {
    roles.push("member", "viewer");
  }

  return roles;
}

export function getRoleLabel(role: ProjectRole | LegacyRole): string {
  if (role in LEGACY_ROLE_LABELS) {
    return LEGACY_ROLE_LABELS[role as LegacyRole];
  }
  return ROLE_LABELS[role as ProjectRole];
}

// Email template data
export interface InvitationEmailData {
  inviterName: string;
  projectName: string;
  role: ProjectRole;
  invitationUrl: string;
  message?: string;
  expiresAt: string;
}

// Validation
export const VALID_ROLES: ProjectRole[] = [
  "owner",
  "admin",
  "member",
  "viewer",
];
export const VALID_LEGACY_ROLES: LegacyRole[] = [
  "admin",
  "designer",
  "developer",
];
export const VALID_INVITATION_STATUSES: InvitationStatus[] = [
  "pending",
  "accepted",
  "declined",
  "expired",
];

export function isValidRole(role: string): role is ProjectRole {
  return VALID_ROLES.includes(role as ProjectRole);
}

export function isValidLegacyRole(role: string): role is LegacyRole {
  return VALID_LEGACY_ROLES.includes(role as LegacyRole);
}

export function isValidAnyRole(role: string): role is ProjectRole | LegacyRole {
  return isValidRole(role) || isValidLegacyRole(role);
}

export function isValidInvitationStatus(
  status: string
): status is InvitationStatus {
  return VALID_INVITATION_STATUSES.includes(status as InvitationStatus);
}
