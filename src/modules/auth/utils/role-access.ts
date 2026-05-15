const EXECUTIVE_ROLE_NAMES = new Set(["ceo", "cto", "cmo"]);
const ADMIN_BYPASS_ROLE_NAMES = new Set(["admin", ...EXECUTIVE_ROLE_NAMES]);

function normalizeRoleName(role: unknown): string | null {
  if (typeof role !== "string") {
    return null;
  }

  const trimmedRole = role.trim();
  if (!trimmedRole) {
    return null;
  }

  if (trimmedRole === trimmedRole.toUpperCase()) {
    return trimmedRole.toLowerCase();
  }

  return `${trimmedRole.charAt(0).toLowerCase()}${trimmedRole.slice(1)}`;
}

export function normalizeRoleNames(roles: Iterable<unknown> | null | undefined): string[] {
  if (!roles) {
    return [];
  }

  return Array.from(roles)
    .map(normalizeRoleName)
    .filter((role): role is string => role !== null);
}

export function hasAnyNormalizedRole(
  roles: Iterable<unknown> | null | undefined,
  expectedRoles: Iterable<string>,
): boolean {
  const normalizedRoles = new Set(normalizeRoleNames(roles));

  for (const expectedRole of expectedRoles) {
    if (normalizedRoles.has(expectedRole)) {
      return true;
    }
  }

  return false;
}

export function hasExecutiveRole(roles: Iterable<unknown> | null | undefined): boolean {
  return hasAnyNormalizedRole(roles, EXECUTIVE_ROLE_NAMES);
}

export function hasAdminBypassRole(roles: Iterable<unknown> | null | undefined): boolean {
  return hasAnyNormalizedRole(roles, ADMIN_BYPASS_ROLE_NAMES);
}
