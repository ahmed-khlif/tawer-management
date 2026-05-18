import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import type { UserRoleOnFrontendSide } from "@/modules/auth/types";

export function canViewProjectTemplates(
  roles: UserRoleOnFrontendSide[] | null | undefined,
): boolean {
  return Array.isArray(roles)
    ? hasPermissions(roles, "projectsManagement", "edit") ||
        hasPermissions(roles, "projectsManagement", "add")
    : false;
}

export function canCreateFromProjectTemplates(
  roles: UserRoleOnFrontendSide[] | null | undefined,
): boolean {
  return Array.isArray(roles)
    ? hasPermissions(roles, "projectsManagement", "add")
    : false;
}
