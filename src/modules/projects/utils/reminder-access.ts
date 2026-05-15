import { hasExecutiveRole, normalizeRoleNames } from "@/modules/auth/utils/role-access";

export interface ProjectReminderAccessOptions {
  userRoles: Iterable<unknown> | null | undefined;
  isProjectManager: boolean;
}

export interface ProjectReminderAccess {
  canReadProjectReminders: boolean;
  canManageProjectReminders: boolean;
  canDismissOwnReminder: boolean;
}

export function resolveProjectReminderAccess(
  options: ProjectReminderAccessOptions,
): ProjectReminderAccess {
  const normalizedRoles = normalizeRoleNames(options.userRoles);
  const isExecutive = hasExecutiveRole(normalizedRoles);
  const isProductOwner = normalizedRoles.includes("productOwner");
  const canManageProjectReminders =
    isExecutive || options.isProjectManager || isProductOwner;

  return {
    canReadProjectReminders: true,
    canManageProjectReminders,
    canDismissOwnReminder: true,
  };
}
