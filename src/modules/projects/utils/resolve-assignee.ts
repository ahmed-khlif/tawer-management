import type { ProjectMember } from "@/modules/projects/types/projects";

export interface ResolvedAssignee {
  /** Full display name (e.g. "Tawer CEO"). Empty string if unresolved. */
  name: string;
  /** 1–2 character initials suitable for an avatar pill. */
  initials: string;
  /** Optional email address (only present when the member record has one). */
  email?: string;
  /** User-type roles attached to the member (e.g. ["MANAGER","DEVELOPER"]). */
  roles?: string[];
  /** True when the member is flagged as a project manager. */
  isManager?: boolean;
}

/**
 * Resolve an `assigneeId` (UUID) to a friendly display name + initials by
 * looking it up in the project's member list. Falls back to a short id-stub
 * only when the user truly isn't in members yet (e.g. just-removed user).
 */
export function resolveAssignee(
  assigneeId: string | undefined | null,
  members: ProjectMember[] | undefined,
): ResolvedAssignee | null {
  if (typeof assigneeId !== "string" || !assigneeId) return null;

  const member = members?.find((m) => m.userId === assigneeId);
  const name =
    member?.memberName ||
    member?.user?.name ||
    "";

  if (name) {
    const tokens = name.trim().split(/\s+/).filter(Boolean);
    const initials =
      tokens.length >= 2
        ? `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`
        : (tokens[0]?.slice(0, 2) ?? "");
    return {
      name,
      initials: initials.toUpperCase(),
      email: member?.user?.email,
      roles: member?.userRoles,
      isManager: member?.isManager,
    };
  }

  return { name: "Unknown user", initials: "?" };
}
