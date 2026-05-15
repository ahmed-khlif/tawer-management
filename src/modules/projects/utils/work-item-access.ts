import {
  hasExecutiveRole,
  normalizeRoleNames,
} from "@/modules/auth/utils/role-access";

const PROJECT_MANAGER_ROLE_NAMES = new Set([
  "tawerDevProjectManager",
  "tawerCreativeProjectManager",
]);

const AGILE_TEAM_MEMBER_ROLE_NAMES = new Set([
  "graphicDesigner",
  "socialMediaManager",
  "contentWriter",
  "videoEditor",
  "uiUxDesigner",
  "softwareEngineer",
  "dataEngineer",
  "devopsEngineer",
  "qualityAssuranceEngineer",
  "mobileAppDeveloper",
  "frontendDeveloper",
  "backendDeveloper",
  "fullStackDeveloper",
  "databaseAdministrator",
  "systemsArchitect",
  "networkEngineer",
  "cyberSecuritySpecialist",
  "seoSpecialist",
  "customerSupport",
]);

export interface ProjectWorkItemAccessOptions {
  userRoles: Iterable<unknown> | null | undefined;
  isProjectManager: boolean;
  isAgileProject: boolean;
}

export interface ProjectWorkItemAccess {
  canViewTasks: boolean;
  canCreateTasks: boolean;
  canEditAnyTask: boolean;
  canEditOwnTask: boolean;
  canDeleteAnyTask: boolean;
  canDeleteOwnTask: boolean;
  canAssignTasks: boolean;
  canUpdateAnyTaskStatus: boolean;
  canUpdateOwnTaskStatus: boolean;
  canBulkUpdateTaskStatus: boolean;
  canManageTaskStatuses: boolean;
  canViewTaskStatuses: boolean;
  canManageTaskLabels: boolean;
  canAssignTaskLabels: boolean;
  canCreateComments: boolean;
  canUpdateOwnComments: boolean;
  canUpdateAnyComments: boolean;
  canDeleteOwnComments: boolean;
  canDeleteAnyComments: boolean;
  canLikeComments: boolean;
  canLogTime: boolean;
  canReadTimeEntries: boolean;
  canUpdateOwnTimeEntries: boolean;
  canUpdateAnyTimeEntries: boolean;
  canDeleteOwnTimeEntries: boolean;
  canDeleteAnyTimeEntries: boolean;
  canManageDependencies: boolean;
  canViewBacklog: boolean;
  canManageBacklog: boolean;
  canMoveTasksToSprint: boolean;
  canViewSprints: boolean;
  canManageSprints: boolean;
  canViewEpics: boolean;
  canManageEpics: boolean;
  canViewMilestones: boolean;
  canManageMilestones: boolean;
  canManageTaskAttachments: boolean;
  canViewSprintAiCapacity: boolean;
}

function hasAnyRole(roleNames: Set<string>, expectedRoles: Iterable<string>): boolean {
  for (const role of expectedRoles) {
    if (roleNames.has(role)) {
      return true;
    }
  }

  return false;
}

export function resolveProjectWorkItemAccess(
  options: ProjectWorkItemAccessOptions,
): ProjectWorkItemAccess {
  const normalizedRoles = normalizeRoleNames(options.userRoles);
  const roleNames = new Set(normalizedRoles);
  const isExecutive = hasExecutiveRole(normalizedRoles);
  const hasProjectManagerRole = hasAnyRole(roleNames, PROJECT_MANAGER_ROLE_NAMES);
  const isProductOwner = roleNames.has("productOwner");
  const isScrumMaster = roleNames.has("scrumMaster");
  const isBusinessAnalyst = roleNames.has("businessAnalyst");
  const isAgileTeamMember = hasAnyRole(roleNames, AGILE_TEAM_MEMBER_ROLE_NAMES);

  const canManageProjectWorkItems =
    isExecutive || options.isProjectManager || hasProjectManagerRole;
  const canModerateTaskFlow =
    canManageProjectWorkItems || isProductOwner || isScrumMaster;
  const canCreateTasks =
    canManageProjectWorkItems || isProductOwner || isBusinessAnalyst;
  const canReadAgileWorkItems =
    canManageProjectWorkItems ||
    isProductOwner ||
    isScrumMaster ||
    isBusinessAnalyst ||
    isAgileTeamMember;
  const canManagePlanningArtifacts = canManageProjectWorkItems || isProductOwner;
  const canUseOwnTaskEditing = isAgileTeamMember;
  const canLogOwnTime = isAgileTeamMember;
  const canReadTime = canModerateTaskFlow || isAgileTeamMember;
  const canManageLabels = canManagePlanningArtifacts;
  const canManageDependencies = canManagePlanningArtifacts;
  const canParticipateInComments = canReadAgileWorkItems;

  return {
    canViewTasks: canReadAgileWorkItems,
    canCreateTasks,
    canEditAnyTask: canModerateTaskFlow,
    canEditOwnTask: canUseOwnTaskEditing,
    canDeleteAnyTask: canManagePlanningArtifacts,
    canDeleteOwnTask: false,
    canAssignTasks: canModerateTaskFlow,
    canUpdateAnyTaskStatus: canModerateTaskFlow,
    canUpdateOwnTaskStatus: canUseOwnTaskEditing,
    canBulkUpdateTaskStatus: canModerateTaskFlow,
    canManageTaskStatuses: canManagePlanningArtifacts,
    canViewTaskStatuses: canReadAgileWorkItems,
    canManageTaskLabels: canManageLabels,
    canAssignTaskLabels: canManageLabels,
    canCreateComments: canParticipateInComments,
    canUpdateOwnComments: canParticipateInComments,
    canUpdateAnyComments: canManagePlanningArtifacts,
    canDeleteOwnComments: canParticipateInComments,
    canDeleteAnyComments: canManagePlanningArtifacts,
    canLikeComments: canParticipateInComments,
    canLogTime: canManageProjectWorkItems || canLogOwnTime,
    canReadTimeEntries: canReadTime,
    canUpdateOwnTimeEntries: canLogOwnTime,
    canUpdateAnyTimeEntries: canManagePlanningArtifacts,
    canDeleteOwnTimeEntries: canLogOwnTime,
    canDeleteAnyTimeEntries: canManagePlanningArtifacts,
    canManageDependencies,
    canViewBacklog: options.isAgileProject && canReadAgileWorkItems,
    canManageBacklog: options.isAgileProject && canModerateTaskFlow,
    canMoveTasksToSprint: options.isAgileProject && canModerateTaskFlow,
    canViewSprints: options.isAgileProject && canReadAgileWorkItems,
    canManageSprints: options.isAgileProject && (canManageProjectWorkItems || isScrumMaster),
    canViewEpics: options.isAgileProject && canReadAgileWorkItems,
    canManageEpics: options.isAgileProject && canManagePlanningArtifacts,
    canViewMilestones: canReadAgileWorkItems,
    canManageMilestones: canManagePlanningArtifacts,
    canManageTaskAttachments: canModerateTaskFlow || canUseOwnTaskEditing,
    canViewSprintAiCapacity: options.isAgileProject && canReadAgileWorkItems,
  };
}
