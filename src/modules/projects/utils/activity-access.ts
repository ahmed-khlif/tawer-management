import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import type { UserRoleOnFrontendSide } from "@/modules/auth/types";

export function canViewProjectActivity(
  roles: UserRoleOnFrontendSide[] | null | undefined,
): boolean {
  return Array.isArray(roles)
    ? hasPermissions(roles, "projectsManagement", "view")
    : false;
}
