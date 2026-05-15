import {
  ProjectContent,
  ProjectInResponseType,
  ProjectInvitation,
  ProjectMember,
  ProjectType,
} from "@/modules/projects/types/projects";

function castProjectMemberToFrontend(
  member: NonNullable<ProjectInResponseType["members"]>[number],
): ProjectMember {
  const rawUser = (member as { user?: unknown }).user as
    | {
        id?: string;
        name?: string;
        email?: string;
        roles?: Array<string | { type?: string }>;
      }
    | undefined;

  const memberName =
    (typeof member.memberName === "string" && member.memberName) ||
    (typeof rawUser?.name === "string" && rawUser.name) ||
    "";

  const nestedUserRoles = Array.isArray(rawUser?.roles)
    ? rawUser.roles
        .map((role) =>
          typeof role === "string"
            ? role
            : typeof role?.type === "string"
              ? role.type
              : "",
        )
        .filter(Boolean)
    : [];

  const userRoles =
    Array.isArray(member.userRoles) && member.userRoles.length > 0
      ? member.userRoles
      : nestedUserRoles;

  return {
    id: member.id,
    isManager: member.isManager,
    userId: member.userId,
    memberName: memberName || undefined,
    userRoles,
    createdAt: new Date(member.createdAt),
    updatedAt: member.updatedAt ? new Date(member.updatedAt) : null,
    projectId: member.projectId,
    user:
      rawUser && typeof rawUser.id === "string" && typeof rawUser.name === "string"
        ? { id: rawUser.id, name: rawUser.name, email: rawUser.email }
        : { id: member.userId, name: memberName || member.userId },
  };
}

export function castProjectToFrontend(raw: ProjectInResponseType): ProjectType {
  const content = raw.contents?.[0];
  const projectName = raw.name || content?.name || "Unnamed Project";
  const projectDescription = raw.description ?? content?.description;
  const projectDetails = raw.details ?? content?.details ?? null;
  const unaccentedName = raw.unaccentedName || content?.unaccentedName;

  // Prefer the flattened member contract emitted by the backend
  // (`memberName` + `userRoles`), while keeping a legacy fallback to nested
  // `user.name` / `user.roles[].type` so older payloads still render safely.
  const members: ProjectMember[] = (raw.members || []).map(
    castProjectMemberToFrontend,
  );

  const invitations: ProjectInvitation[] = (raw.invitations || []).map((inv) => ({
    id: inv.id,
    email: inv.email,
    status: inv.status,
    token: inv.token,
    expiresAt: new Date(inv.expiresAt),
    projectId: inv.projectId,
    invitedById: inv.invitedById,
    createdAt: new Date(inv.createdAt),
    updatedAt: inv.updatedAt ? new Date(inv.updatedAt) : undefined,
    isManager: inv.isManager,
  }));

  const contents: ProjectContent[] = (raw.contents || []).map((c) => ({
    id: c.id,
    name: c.name,
    unaccentedName: c.unaccentedName,
    description: c.description,
    details: c.details,
    language: c.language,
    projectId: c.projectId,
    createdAt: new Date(c.createdAt),
    updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
  }));

  return {
    id: raw.id,
    slug: raw.id,
    name: projectName,
    unaccentedName,
    description: projectDescription ?? undefined,
    details: projectDetails,
    repositoryUrl: raw.repositoryUrl,
    liveUrl: raw.liveUrl,
    startTime: new Date(raw.startDate),
    endTime: new Date(raw.endDate),
    estimatedStartDate: raw.estimatedStartDate
      ? new Date(raw.estimatedStartDate)
      : undefined,
    estimatedEndDate: raw.estimatedEndDate
      ? new Date(raw.estimatedEndDate)
      : undefined,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt || raw.createdAt),
    status: raw.status,
    projectType: raw.projectType,
    displayOrder: raw.displayOrder || 0,
    isArchived: raw.isArchived ?? false,
    paid: raw.paid ?? false,
    businessUnit: raw.businessUnit,
    isFavorite: raw.isFavorite,
    kanbanSettings: raw.kanbanSettings,
    createdById: raw.createdById,
    createdByName: raw.createdByName,
    memberCount: raw.memberCount,
    createdBy:
      raw.createdBy ||
      (raw.createdById && raw.createdByName
        ? { id: raw.createdById, name: raw.createdByName }
        : undefined),
    members,
    invitations,
    contents,
  };
}
