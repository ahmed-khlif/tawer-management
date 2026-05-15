import { hasExecutiveRole } from "@/modules/auth/utils/role-access";

export interface ProjectMemberAccessOptions {
  userRoles: Iterable<unknown> | null | undefined;
  isProjectManager: boolean;
}

export interface ProjectMemberAccess {
  isExecutive: boolean;
  canManageMembers: boolean;
  canInviteMembers: boolean;
  canDirectAddMembers: boolean;
  canManageManagers: boolean;
  canRemoveMembers: boolean;
  canRemoveLastManager: boolean;
}

export function resolveProjectMemberAccess(
  options: ProjectMemberAccessOptions,
): ProjectMemberAccess {
  const isExecutive = hasExecutiveRole(options.userRoles);
  const canManageMembers = isExecutive || options.isProjectManager;

  return {
    isExecutive,
    canManageMembers,
    canInviteMembers: canManageMembers,
    canDirectAddMembers: isExecutive,
    canManageManagers: canManageMembers,
    canRemoveMembers: canManageMembers,
    canRemoveLastManager: isExecutive,
  };
}
