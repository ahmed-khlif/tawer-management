import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import { hasAdminBypassRole } from "@/modules/auth/utils/role-access";
import { canSeeProjectExecutivePanels } from "@/modules/analytics/utils/access";
import { ProjectType } from "../../types/projects";
import { resolveProjectMemberAccess } from "../../utils/member-access";
import { resolveProjectReminderAccess } from "../../utils/reminder-access";
import { resolveProjectWorkItemAccess } from "../../utils/work-item-access";
import useProject from "../projects/use-project";

export interface ProjectPermissions {
  // Coarse project-level
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canInviteMembers: boolean;
  canDirectAddMembers: boolean;
  // Sprints
  canCreateSprint: boolean;
  canEditSprint: boolean;
  canDeleteSprint: boolean;
  canViewSprint: boolean;
  canManageSprintAttachments: boolean;
  // Epics
  canCreateEpic: boolean;
  canEditEpic: boolean;
  canDeleteEpic: boolean;
  canViewEpic: boolean;
  // Milestones
  canCreateMilestone: boolean;
  canEditMilestone: boolean;
  canDeleteMilestone: boolean;
  canViewMilestone: boolean;
  canCompleteMilestone: boolean;
  // Tasks (basic)
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canViewTask: boolean;
  canAssignTask: boolean;
  // Tasks (granular — backend distinguishes own vs any)
  canEditOwnTask: boolean;
  canEditAnyTask: boolean;
  canDeleteOwnTask: boolean;
  canDeleteAnyTask: boolean;
  canUpdateStatusOwn: boolean;
  canUpdateStatusAny: boolean;
  canBulkUpdateStatus: boolean;
  // Custom statuses
  canManageTaskStatuses: boolean;
  canViewTaskStatuses: boolean;
  // Labels
  canManageLabels: boolean;
  canCreateLabel: boolean;
  canUpdateLabel: boolean;
  canDeleteLabel: boolean;
  canAssignLabel: boolean;
  // Comments (own vs any)
  canCreateComment: boolean;
  canUpdateOwnComment: boolean;
  canUpdateAnyComment: boolean;
  canDeleteOwnComment: boolean;
  canDeleteAnyComment: boolean;
  canLikeComment: boolean;
  // Time entries
  canLogTime: boolean;
  canReadTimeEntries: boolean;
  canUpdateOwnTimeEntry: boolean;
  canUpdateAnyTimeEntry: boolean;
  canDeleteOwnTimeEntry: boolean;
  canDeleteAnyTimeEntry: boolean;
  // Dependencies
  canAddDependency: boolean;
  canRemoveDependency: boolean;
  // Backlog
  canViewBacklog: boolean;
  canManageBacklog: boolean;
  canMoveTaskToSprint: boolean;
  // Attachments
  canManageTaskAttachments: boolean;
  // Reminders
  canCreateReminder: boolean;
  canEditAnyReminder: boolean;
  canEditReminder: boolean;
  canDeleteAnyReminder: boolean;
  canDeleteReminder: boolean;
  canCancelReminder: boolean;
  canDismissOwnReminder: boolean;
  // Analytics & AI
  canViewAnalytics: boolean;
  canViewAiInsights: boolean;
  canUseAiSuggestions: boolean;
  canViewSprintAiCapacity: boolean;
  canViewExecutiveAnalytics: boolean;
  canOpenEmployeeAnalyticsFromProject: boolean;
  // Membership info
  isMember: boolean;
  isProjectManager: boolean;
  hasAdminBypass: boolean;
  // Legacy aliases (kept for existing UI references)
  canEditProject: boolean;
  canDeleteProject: boolean;
  canAddMember: boolean;
  canRemoveMember: boolean;
  canManageManagers: boolean;
  canRemoveLastManager: boolean;
  canAddTask: boolean;
  canManageSprints: boolean;
  // Predicates
  isOwnTask: (task: { assigneeId?: string | null; assigneeIds?: string[] | null }) => boolean;
  isOwnComment: (comment: { authorId?: string | null; userId?: string | null }) => boolean;
  isOwnTimeEntry: (entry: { userId?: string | null }) => boolean;
}

const NO_PERMISSIONS: ProjectPermissions = {
  canView: false,
  canEdit: false,
  canDelete: false,
  canManageMembers: false,
  canInviteMembers: false,
  canDirectAddMembers: false,
  canCreateSprint: false,
  canEditSprint: false,
  canDeleteSprint: false,
  canViewSprint: false,
  canManageSprintAttachments: false,
  canCreateEpic: false,
  canEditEpic: false,
  canDeleteEpic: false,
  canViewEpic: false,
  canCreateMilestone: false,
  canEditMilestone: false,
  canDeleteMilestone: false,
  canViewMilestone: false,
  canCompleteMilestone: false,
  canCreateTask: false,
  canEditTask: false,
  canDeleteTask: false,
  canViewTask: false,
  canAssignTask: false,
  canEditOwnTask: false,
  canEditAnyTask: false,
  canDeleteOwnTask: false,
  canDeleteAnyTask: false,
  canUpdateStatusOwn: false,
  canUpdateStatusAny: false,
  canBulkUpdateStatus: false,
  canManageTaskStatuses: false,
  canViewTaskStatuses: false,
  canManageLabels: false,
  canCreateLabel: false,
  canUpdateLabel: false,
  canDeleteLabel: false,
  canAssignLabel: false,
  canCreateComment: false,
  canUpdateOwnComment: false,
  canUpdateAnyComment: false,
  canDeleteOwnComment: false,
  canDeleteAnyComment: false,
  canLikeComment: false,
  canLogTime: false,
  canReadTimeEntries: false,
  canUpdateOwnTimeEntry: false,
  canUpdateAnyTimeEntry: false,
  canDeleteOwnTimeEntry: false,
  canDeleteAnyTimeEntry: false,
  canAddDependency: false,
  canRemoveDependency: false,
  canViewBacklog: false,
  canManageBacklog: false,
  canMoveTaskToSprint: false,
  canManageTaskAttachments: false,
  canCreateReminder: false,
  canEditAnyReminder: false,
  canEditReminder: false,
  canDeleteAnyReminder: false,
  canDeleteReminder: false,
  canCancelReminder: false,
  canDismissOwnReminder: false,
  canViewAnalytics: false,
  canViewAiInsights: false,
  canUseAiSuggestions: false,
  canViewSprintAiCapacity: false,
  canViewExecutiveAnalytics: false,
  canOpenEmployeeAnalyticsFromProject: false,
  isMember: false,
  isProjectManager: false,
  hasAdminBypass: false,
  canEditProject: false,
  canDeleteProject: false,
  canAddMember: false,
  canRemoveMember: false,
  canManageManagers: false,
  canRemoveLastManager: false,
  canAddTask: false,
  canManageSprints: false,
  isOwnTask: () => false,
  isOwnComment: () => false,
  isOwnTimeEntry: () => false,
};

const ALL_TRUE: ProjectPermissions = Object.keys(NO_PERMISSIONS).reduce((acc, key) => {
  if (typeof (NO_PERMISSIONS as any)[key] === "function") {
    (acc as any)[key] = () => true;
  } else {
    (acc as any)[key] = true;
  }
  return acc;
}, {} as ProjectPermissions);

export default function useProjectPermissions(
  projectOrSlug: string | Pick<ProjectType, "id">,
): ProjectPermissions {
  const projectSlug =
    typeof projectOrSlug === "string" ? projectOrSlug : projectOrSlug.id;
  const { user } = useCurrentUser();
  const { project } = useProject(projectSlug);

  const isOwnTask = (task: { assigneeId?: string | null; assigneeIds?: string[] | null }) => {
    if (!user) return false;
    if (task.assigneeId && task.assigneeId === user.id) return true;
    if (Array.isArray(task.assigneeIds) && task.assigneeIds.includes(user.id)) return true;
    return false;
  };
  const isOwnComment = (comment: { authorId?: string | null; userId?: string | null }) => {
    if (!user) return false;
    return comment.authorId === user.id || comment.userId === user.id;
  };
  const isOwnTimeEntry = (entry: { userId?: string | null }) => {
    if (!user) return false;
    return entry.userId === user.id;
  };

  if (!user) {
    return NO_PERMISSIONS;
  }

  const hasAdminBypass = hasAdminBypassRole(user.roles);

  if (hasAdminBypass) {
    return {
      ...ALL_TRUE,
      isOwnTask,
      isOwnComment,
      isOwnTimeEntry,
    };
  }

  const currentMember = project?.members?.find((member) => member.userId === user.id);
  const isMember = !!currentMember;
  const isProjectManager = currentMember?.isManager === true;
  const isAgileProject = project?.projectType === "AGILE";

  const roleCanView = hasPermissions(user.roles, "projectsManagement", "view");
  const roleCanAdd = hasPermissions(user.roles, "projectsManagement", "add");
  const roleCanEdit = hasPermissions(user.roles, "projectsManagement", "edit");
  const roleCanDelete = hasPermissions(user.roles, "projectsManagement", "delete");

  // Check if user has any manager roles that should give them project management access
  const hasManagerRole = user.roles.some(role =>
    ["tawerDevProjectManager", "tawerCreativeProjectManager", "productOwner", "scrumMaster"].includes(role)
  );

  const canView = roleCanView || isMember;
  const canEdit = roleCanEdit || isProjectManager || hasManagerRole;
  const canDelete = roleCanDelete || isProjectManager || hasManagerRole;
  const memberAccess = resolveProjectMemberAccess({
    userRoles: user.roles,
    isProjectManager,
  });
  const reminderAccess = resolveProjectReminderAccess({
    userRoles: user.roles,
    isProjectManager,
  });
  const workItemAccess = resolveProjectWorkItemAccess({
    userRoles: user.roles,
    isProjectManager,
    isAgileProject,
  });
  const canManageMembers = memberAccess.canManageMembers;
  const canInviteMembers = memberAccess.canInviteMembers;
  const canDirectAddMembers = memberAccess.canDirectAddMembers;

  // Tasks
  const canViewTask = canView && workItemAccess.canViewTasks;
  const canCreateTask = canView && workItemAccess.canCreateTasks;
  const canEditAnyTask = canView && workItemAccess.canEditAnyTask;
  const canEditOwnTask = canView && workItemAccess.canEditOwnTask;
  const canEditTask = canEditAnyTask || canEditOwnTask;
  const canDeleteAnyTask = canView && workItemAccess.canDeleteAnyTask;
  const canDeleteOwnTask = canView && workItemAccess.canDeleteOwnTask;
  const canDeleteTask = canDeleteAnyTask || canDeleteOwnTask;
  const canAssignTask = canView && workItemAccess.canAssignTasks;
  const canUpdateStatusAny = canView && workItemAccess.canUpdateAnyTaskStatus;
  const canUpdateStatusOwn = canView && workItemAccess.canUpdateOwnTaskStatus;
  const canBulkUpdateStatus = canView && workItemAccess.canBulkUpdateTaskStatus;
  const canManageTaskAttachments =
    canView && workItemAccess.canManageTaskAttachments;

  // Custom statuses
  const canManageTaskStatuses =
    canView && workItemAccess.canManageTaskStatuses;
  const canViewTaskStatuses = canView && workItemAccess.canViewTaskStatuses;

  // Labels
  const canManageLabels = canView && workItemAccess.canManageTaskLabels;
  const canCreateLabel = canManageLabels;
  const canUpdateLabel = canManageLabels;
  const canDeleteLabel = canManageLabels;
  const canAssignLabel = canView && workItemAccess.canAssignTaskLabels;

  // Comments
  const canCreateComment = canView && workItemAccess.canCreateComments;
  const canUpdateOwnComment = canView && workItemAccess.canUpdateOwnComments;
  const canUpdateAnyComment = canView && workItemAccess.canUpdateAnyComments;
  const canDeleteOwnComment = canView && workItemAccess.canDeleteOwnComments;
  const canDeleteAnyComment = canView && workItemAccess.canDeleteAnyComments;
  const canLikeComment = canView && workItemAccess.canLikeComments;

  // Time entries
  const canLogTime = canView && workItemAccess.canLogTime;
  const canReadTimeEntries = canView && workItemAccess.canReadTimeEntries;
  const canUpdateOwnTimeEntry =
    canView && workItemAccess.canUpdateOwnTimeEntries;
  const canUpdateAnyTimeEntry =
    canView && workItemAccess.canUpdateAnyTimeEntries;
  const canDeleteOwnTimeEntry =
    canView && workItemAccess.canDeleteOwnTimeEntries;
  const canDeleteAnyTimeEntry =
    canView && workItemAccess.canDeleteAnyTimeEntries;

  // Dependencies
  const canAddDependency = canView && workItemAccess.canManageDependencies;
  const canRemoveDependency = canView && workItemAccess.canManageDependencies;

  // Backlog
  const canViewBacklog = canView && workItemAccess.canViewBacklog;
  const canManageBacklog = canView && workItemAccess.canManageBacklog;
  const canMoveTaskToSprint = canView && workItemAccess.canMoveTasksToSprint;

  // Sprints
  const canViewSprint = canView && workItemAccess.canViewSprints;
  const canCreateSprint = canView && workItemAccess.canManageSprints;
  const canEditSprint = canView && workItemAccess.canManageSprints;
  const canDeleteSprint = canView && workItemAccess.canManageSprints;
  const canManageSprintAttachments = canView && workItemAccess.canManageSprints;

  // Epics
  const canViewEpic = canView && workItemAccess.canViewEpics;
  const canCreateEpic = canView && workItemAccess.canManageEpics;
  const canEditEpic = canView && workItemAccess.canManageEpics;
  const canDeleteEpic = canView && workItemAccess.canManageEpics;

  // Milestones (work in both AGILE and FREESTYLE)
  const canViewMilestone = canView && workItemAccess.canViewMilestones;
  const canCreateMilestone = canView && workItemAccess.canManageMilestones;
  const canEditMilestone = canView && workItemAccess.canManageMilestones;
  const canDeleteMilestone = canView && workItemAccess.canManageMilestones;
  const canCompleteMilestone = canView && workItemAccess.canManageMilestones;

  // Reminders - Project managers can manage reminders in their projects, or users with global permissions
  const canCreateReminder = reminderAccess.canManageProjectReminders;
  const canEditAnyReminder = reminderAccess.canManageProjectReminders;
  const canEditOwnReminder = false;
  const canEditReminder = reminderAccess.canManageProjectReminders;
  const canDeleteAnyReminder = reminderAccess.canManageProjectReminders;
  const canDeleteOwnReminder = false;
  const canDeleteReminder = reminderAccess.canManageProjectReminders;
  const canCancelReminder = reminderAccess.canManageProjectReminders;
  const canDismissOwnReminder = reminderAccess.canDismissOwnReminder;

  // Analytics & AI
  const canViewAnalytics = canView;
  const canViewAiInsights = canView;
  const canUseAiSuggestions = canAssignTask || canEditTask;
  const canViewSprintAiCapacity =
    canView && workItemAccess.canViewSprintAiCapacity;
  const canViewExecutiveAnalytics = canSeeProjectExecutivePanels(user.roles);
  const canOpenEmployeeAnalyticsFromProject = canView;

  return {
    canView,
    canEdit,
    canDelete,
    canManageMembers,
    canInviteMembers,
    canDirectAddMembers,
    canCreateSprint,
    canEditSprint,
    canDeleteSprint,
    canViewSprint,
    canManageSprintAttachments,
    canCreateEpic,
    canEditEpic,
    canDeleteEpic,
    canViewEpic,
    canCreateMilestone,
    canEditMilestone,
    canDeleteMilestone,
    canViewMilestone,
    canCompleteMilestone,
    canCreateTask,
    canEditTask,
    canDeleteTask,
    canViewTask,
    canAssignTask,
    canEditOwnTask,
    canEditAnyTask,
    canDeleteOwnTask,
    canDeleteAnyTask,
    canUpdateStatusOwn,
    canUpdateStatusAny,
    canBulkUpdateStatus,
    canManageTaskStatuses,
    canViewTaskStatuses,
    canManageLabels,
    canCreateLabel,
    canUpdateLabel,
    canDeleteLabel,
    canAssignLabel,
    canCreateComment,
    canUpdateOwnComment,
    canUpdateAnyComment,
    canDeleteOwnComment,
    canDeleteAnyComment,
    canLikeComment,
    canLogTime,
    canReadTimeEntries,
    canUpdateOwnTimeEntry,
    canUpdateAnyTimeEntry,
    canDeleteOwnTimeEntry,
    canDeleteAnyTimeEntry,
    canAddDependency,
    canRemoveDependency,
    canViewBacklog,
    canManageBacklog,
    canMoveTaskToSprint,
    canManageTaskAttachments,
    canCreateReminder,
    canEditAnyReminder,
    canEditReminder,
    canDeleteAnyReminder,
    canDeleteReminder,
    canCancelReminder,
    canDismissOwnReminder,
    canViewAnalytics,
    canViewAiInsights,
    canUseAiSuggestions,
    canViewSprintAiCapacity,
    canViewExecutiveAnalytics,
    canOpenEmployeeAnalyticsFromProject,
    isMember,
    isProjectManager,
    hasAdminBypass,
    canEditProject: canEdit,
    canDeleteProject: canDelete,
    canAddMember: canInviteMembers,
    canRemoveMember: memberAccess.canRemoveMembers,
    canManageManagers: memberAccess.canManageManagers,
    canRemoveLastManager: memberAccess.canRemoveLastManager,
    canAddTask: canCreateTask,
    canManageSprints: canCreateSprint || canEditSprint || canDeleteSprint,
    isOwnTask,
    isOwnComment,
    isOwnTimeEntry,
  };
}
