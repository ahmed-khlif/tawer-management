import { hasExecutiveRole } from "@/modules/auth/utils/role-access";

type UserLike = {
  id?: string | null;
  roles?: Iterable<unknown> | null;
} | null | undefined;

export type EmployeeAnalyticsAccessState =
  | "self"
  | "executive"
  | "defer_to_backend";

export interface EmployeeAnalyticsAccessResult {
  canLoad: boolean;
  state: EmployeeAnalyticsAccessState;
  backHref: string;
  backLabel: string;
}

export function canViewExecutiveOverview(userRoles: Iterable<unknown> | null | undefined): boolean {
  return hasExecutiveRole(userRoles);
}

export function canSeeAnalyticsNav(userRoles: Iterable<unknown> | null | undefined): boolean {
  return canViewExecutiveOverview(userRoles);
}

export function canSeeProjectExecutivePanels(
  userRoles: Iterable<unknown> | null | undefined,
): boolean {
  return canViewExecutiveOverview(userRoles);
}

export function canExportExecutiveAnalytics(
  userRoles: Iterable<unknown> | null | undefined,
): boolean {
  return canViewExecutiveOverview(userRoles);
}

export function resolveEmployeeAnalyticsAccess({
  currentUser,
  targetUserId,
}: {
  currentUser: UserLike;
  targetUserId: string;
}): EmployeeAnalyticsAccessResult {
  if (!currentUser?.id) {
    return {
      canLoad: false,
      state: "defer_to_backend",
      backHref: "/dashboard/projects",
      backLabel: "Back to projects",
    };
  }

  if (currentUser.id === targetUserId) {
    return {
      canLoad: true,
      state: "self",
      backHref: "/dashboard/projects",
      backLabel: "Back to projects",
    };
  }

  if (canViewExecutiveOverview(currentUser.roles)) {
    return {
      canLoad: true,
      state: "executive",
      backHref: "/dashboard/analytics",
      backLabel: "Back to executive analytics",
    };
  }

  return {
    canLoad: true,
    state: "defer_to_backend",
    backHref: "/dashboard/projects",
    backLabel: "Back to projects",
  };
}

export function canExportEmployeeAnalytics(
  access: EmployeeAnalyticsAccessResult,
): boolean {
  return access.canLoad;
}
