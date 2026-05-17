"use client";
import React from "react";
import {
  Plus,
  Users,
  UserCheck,
  Send,
  Crown,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { FilterMenu } from "../../shared/filter-menu";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProjectType } from "../../../types/projects";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import { Toolbar } from "../../shared/toolbar";
import { MembersListCard } from "./members-list-card";
import { InvitationsListCard } from "./invitations-list-card";
import { AddMemberDialog } from "./add-member-dialog";
import { InviteByEmailDialog } from "./invite-by-email-dialog";
import { MembersGrid } from "./members-grid";
import useProjectMembers from "../../../hooks/members/use-project-members";
import useProjectInvitations from "../../../hooks/members/use-project-invitations";
import useProjectPermissions from "../../../hooks/permissions/use-project-permissions";
import useProjectTasks from "../../../hooks/tasks/use-project-tasks";

interface Props {
  project: ProjectType;
}

export default function ProjectMembers({ project }: Props) {
  const t = useTranslations("modules.projects.project.details");
  const members = project.members || [];
  const invitations = project.invitations || [];

  const { updateRole, removeMember, isPending: memberPending } =
    useProjectMembers(project.id);
  const { revokeInvitation, resendInvitation, isPending: invitePending } =
    useProjectInvitations(project.id);
  const {
    canManageMembers,
    canInviteMembers,
    canDirectAddMembers,
    canRemoveMember,
    canManageManagers,
    canRemoveLastManager,
    canOpenEmployeeAnalyticsFromProject,
  } = useProjectPermissions(project);

  const { tasks, tasksAreLoading } = useProjectTasks(project.id);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<string | null>(
    null,
  );
  const [inviteToRevoke, setInviteToRevoke] = React.useState<string | null>(
    null,
  );

  // State for Toolbar and Tabs
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = React.useState("members");

  // Reset to members tab if user can't see invitations
  React.useEffect(() => {
    if (!canInviteMembers && activeTab === "invitations") {
      setActiveTab("members");
    }
  }, [canInviteMembers, activeTab]);

  // Filters state
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  const [selectedTaskStatus, setSelectedTaskStatus] = React.useState<string[]>([]);
  const [selectedInviteStatus, setSelectedInviteStatus] = React.useState<string[]>([]);

  const totalMembers = members.length;
  const managerCount = members.filter((m) => m.isManager).length;
  const pendingInvitations = invitations.filter(
    (i) => (i.status as string)?.toLowerCase?.() === "pending",
  ).length;

  // Filter logic
  const filteredMembers = members.filter((member) => {
    // Search
    const searchLower = search.toLowerCase();
    const name = (member.user?.name || member.userId).toLowerCase();
    const email = (member.user?.email || "").toLowerCase();
    const matchesSearch = name.includes(searchLower) || email.includes(searchLower);
    if (!matchesSearch) return false;

    // Role
    if (selectedRoles.length > 0) {
      const isManager = member.isManager;
      if (selectedRoles.includes("manager") && !isManager) return false;
      if (selectedRoles.includes("member") && isManager) return false;
    }

    // Task Status
    if (selectedTaskStatus.length > 0) {
      const memberTasks = tasks.filter((t) => t.assigneeId === member.userId);
      const total = memberTasks.length;
      const done = memberTasks.filter((t) => 
        ["DONE", "COMPLETED"].includes(t.status?.toUpperCase() ?? "")
      ).length;

      const isIdle = total === 0;
      const isCompleted = total > 0 && done === total;
      const isActive = total > 0 && done < total;

      if (selectedTaskStatus.includes("active") && !isActive) return false;
      if (selectedTaskStatus.includes("idle") && !isIdle) return false;
      if (selectedTaskStatus.includes("completed") && !isCompleted) return false;
    }

    return true;
  });

  const filteredInvitations = invitations.filter((invite) => {
    // Search
    const searchLower = search.toLowerCase();
    const matchesSearch = invite.email.toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;

    // Status
    if (selectedInviteStatus.length > 0) {
      if (!selectedInviteStatus.includes((invite.status as string)?.toLowerCase())) return false;
    }

    return true;
  });

  const activeFiltersCount = 
    (activeTab === "members" ? selectedRoles.length + selectedTaskStatus.length : selectedInviteStatus.length);

  const activeFiltersChips = React.useMemo(() => {
    const chips: any[] = [];

    if (activeTab === "members") {
      selectedRoles.forEach(role => {
        chips.push({
          id: `role-${role}`,
          prefix: "Role",
          label: role === "manager" ? "Managers" : "Members",
          onRemove: () => setSelectedRoles(prev => prev.filter(r => r !== role))
        });
      });

      selectedTaskStatus.forEach(status => {
        chips.push({
          id: `task-${status}`,
          prefix: "Status",
          label: status.charAt(0).toUpperCase() + status.slice(1),
          onRemove: () => setSelectedTaskStatus(prev => prev.filter(s => s !== status))
        });
      });
    } else {
      selectedInviteStatus.forEach(status => {
        chips.push({
          id: `invite-${status}`,
          prefix: "Status",
          label: status.charAt(0).toUpperCase() + status.slice(1),
          onRemove: () => setSelectedInviteStatus(prev => prev.filter(s => s !== status))
        });
      });
    }

    return chips;
  }, [activeTab, selectedRoles, selectedTaskStatus, selectedInviteStatus]);

  return (
    <div className="space-y-0">
      <PageHeaderStrip
        icon={Users}
        title={t("membersList.title")}
        description={t("membersList.description")}
        metrics={[
          {
            icon: UserCheck,
            value: totalMembers,
            label: t("membersList.metricsTotal", { defaultValue: "members" }),
          },
          managerCount > 0
            ? {
                icon: Crown,
                value: managerCount,
                label: t("membersList.metricsManagers", {
                  defaultValue: "managers",
                }),
                tone: "info",
              }
            : false,
          pendingInvitations > 0
            ? {
                icon: Send,
                value: pendingInvitations,
                label: t("membersList.metricsPending", {
                  defaultValue: "pending",
                }),
                tone: "warning",
              }
            : false,
        ]}
        actions={
          <div className="flex items-center gap-2">
            {canInviteMembers ? (
              <Button
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                className="gap-1.5 shadow-sm"
              >
                <Plus className="size-4" />
                {t("membersList.addMember", { defaultValue: "Add Member" })}
              </Button>
            ) : null}
          </div>
        }
      />

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          activeTab === "invitations"
            ? t("invitationsList.searchPlaceholder", {
                defaultValue: "Search invitations...",
              })
            : t("membersList.searchPlaceholder", {
                defaultValue: "Search members...",
              })
        }
        viewMode={viewMode as any}
        onViewModeChange={(mode) => setViewMode(mode as any)}
        tabs={
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="members">
                <div className="flex items-center gap-2">
                  {t("membersList.tabs.active", { defaultValue: "Members" })}
                  <Badge variant="secondary" className="h-5 px-1.5 font-normal">
                    {totalMembers}
                  </Badge>
                </div>
              </TabsTrigger>
              {canInviteMembers && (
                <TabsTrigger value="invitations">
                  <div className="flex items-center gap-2">
                    {t("membersList.tabs.invitations", {
                      defaultValue: "Invitations",
                    })}
                    <Badge variant="secondary" className="h-5 px-1.5 font-normal">
                      {pendingInvitations}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        }
        filterContent={
          <FilterMenu
            categories={activeTab === "members" ? [
              {
                id: "role",
                label: "Role",
                icon: ShieldCheck,
                multiple: true,
                options: [
                  { id: "manager", label: "Managers", icon: Crown },
                  { id: "member", label: "Members", icon: Users },
                ],
                selectedIds: selectedRoles,
                onToggle: (id) =>
                  setSelectedRoles((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
                  ),
              },
              {
                id: "tasks",
                label: "Task Activity",
                icon: Clock,
                multiple: true,
                options: [
                  { id: "active", label: "Active (Work in progress)", icon: Clock },
                  { id: "completed", label: "Completed (All tasks done)", icon: CheckCircle2, iconClassName: "text-success" },
                  { id: "idle", label: "Idle (No tasks assigned)", icon: XCircle, iconClassName: "text-muted-foreground" },
                ],
                selectedIds: selectedTaskStatus,
                onToggle: (id) =>
                  setSelectedTaskStatus((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
                  ),
              },
            ] : [
              {
                id: "status",
                label: "Invitation Status",
                icon: Activity,
                multiple: true,
                options: [
                  { id: "pending", label: "Pending", icon: Clock },
                  { id: "accepted", label: "Accepted", icon: CheckCircle2, iconClassName: "text-success" },
                  { id: "declined", label: "Declined", icon: XCircle, iconClassName: "text-destructive" },
                  { id: "revoked", label: "Revoked", icon: AlertCircle, iconClassName: "text-warning" },
                ],
                selectedIds: selectedInviteStatus,
                onToggle: (id) =>
                  setSelectedInviteStatus((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
                  ),
              },
            ]}
          />
        }
        activeFilterCount={activeFiltersCount}
        activeFilters={activeFiltersChips}
        onClearAllFilters={() => {
          if (activeTab === "members") {
            setSelectedRoles([]);
            setSelectedTaskStatus([]);
          } else {
            setSelectedInviteStatus([]);
          }
        }}
      />

      <div className="py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="members" className="mt-0 focus-visible:outline-none">
            {viewMode === "grid" ? (
              <MembersGrid
                members={filteredMembers}
                tasks={tasks}
                onUpdateRole={updateRole}
                onRemoveMember={setMemberToRemove}
                onAddMember={() => setInviteDialogOpen(true)}
                isPending={memberPending}
                tasksAreLoading={tasksAreLoading}
                canRemoveMember={canRemoveMember}
                canManageManagers={canManageManagers}
                canManageMembers={canManageMembers}
                canRemoveLastManager={canRemoveLastManager}
                canViewEmployeeAnalytics={canOpenEmployeeAnalyticsFromProject}
              />
            ) : (
              <MembersListCard
                members={filteredMembers}
                tasks={tasks}
                onUpdateRole={updateRole}
                onRemoveMember={setMemberToRemove}
                isPending={memberPending}
                canRemoveMember={canRemoveMember}
                canManageManagers={canManageManagers}
                canRemoveLastManager={canRemoveLastManager}
                canViewEmployeeAnalytics={canOpenEmployeeAnalyticsFromProject}
              />
            )}
          </TabsContent>
          {canInviteMembers && (
            <TabsContent
              value="invitations"
              className="mt-0 focus-visible:outline-none"
            >
              <div className="mx-auto w-full max-w-6xl">
                <InvitationsListCard
                  invitations={filteredInvitations}
                  onResend={resendInvitation}
                  onRevoke={setInviteToRevoke}
                  isPending={invitePending}
                  canManage={canInviteMembers || canManageMembers}
                  viewMode={viewMode}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <AddMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        projectId={project.id}
      />
      <InviteByEmailDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        projectId={project.id}
      />

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(o) => !o && setMemberToRemove(null)}
        title={t("membersList.removeTitle", { defaultValue: "Remove Member" })}
        description={t("membersList.removeDescription", {
          defaultValue:
            "Are you sure you want to remove this member from the project?",
        })}
        onConfirm={() => {
          if (memberToRemove) {
            removeMember(memberToRemove);
            setMemberToRemove(null);
          }
        }}
        onCancel={() => setMemberToRemove(null)}
        confirmLabel={t("membersList.remove")}
      />

      <ConfirmDialog
        open={!!inviteToRevoke}
        onOpenChange={(o) => !o && setInviteToRevoke(null)}
        title={t("invitationsList.revokeTitle", {
          defaultValue: "Revoke Invitation",
        })}
        description={t("invitationsList.revokeDescription", {
          defaultValue: "Are you sure you want to revoke this invitation?",
        })}
        onConfirm={() => {
          if (inviteToRevoke) {
            revokeInvitation(inviteToRevoke);
            setInviteToRevoke(null);
          }
        }}
        onCancel={() => setInviteToRevoke(null)}
        confirmLabel={t("invitationsList.cancel")}
      />
    </div>
  );
}
