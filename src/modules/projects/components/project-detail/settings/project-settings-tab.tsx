"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Clock,
  Columns3,
  LayoutGrid,
  ListChecks,
  Settings as SettingsIcon,
  ShieldCheck,
  Tag,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectType } from "@/modules/projects/types/projects";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import {
  archiveProject,
  deleteProject,
  restoreProject,
} from "@/modules/projects/services/api/project-lifecycle";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import ProjectSettings from "./project-settings";
import KanbanSettingsForm from "./kanban-settings-form";
import TaskStatusesManager from "./task-statuses-manager";
import TaskLabelsManager from "./task-labels-manager";

interface ProjectSettingsTabProps {
  project: ProjectType;
  permissions: ProjectPermissions;
}

function SettingsSectionNav({
  items,
  title,
  ariaLabel,
}: {
  items: { href: string; label: string; icon: LucideIcon }[];
  title: string;
  ariaLabel: string;
}) {
  const linkDesktop = cn(
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors",
    "hover:bg-muted hover:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  );
  const linkMobile = cn(
    "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5",
    "text-xs font-medium text-muted-foreground shadow-sm transition-colors",
    "hover:bg-muted hover:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  return (
    <>
      <nav
        aria-label={ariaLabel}
        className="-mx-1 flex gap-2 overflow-x-auto pb-3 lg:hidden"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.href} href={item.href} className={linkMobile}>
              <Icon className="size-3.5 opacity-70" aria-hidden />
              {item.label}
            </a>
          );
        })}
      </nav>
      <nav aria-label={ariaLabel} className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] space-y-0.5 overflow-y-auto rounded-xl border bg-card p-3 shadow-sm">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.href} href={item.href} className={linkDesktop}>
                <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function ProjectSettingsTab({ project, permissions }: ProjectSettingsTabProps) {
  const t = useTranslations("modules.projects.project.details.settings");
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const archiveMutation = useMutation({
    mutationFn: () =>
      project.isArchived ? restoreProject(project.id) : archiveProject(project.id),
    onSuccess: async () => {
      toast.success(
        project.isArchived
          ? t("restoreSuccess", { defaultValue: "Project restored." })
          : t("archiveSuccess", { defaultValue: "Project archived." }),
      );
      await queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          (project.isArchived
            ? t("restoreError", { defaultValue: "Failed to restore project." })
            : t("archiveError", { defaultValue: "Failed to archive project." })),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => {
      toast.success(t("deleteSuccess", { defaultValue: "Project deleted." }));
      queryClient.removeQueries({ queryKey: ["project", project.id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/dashboard/projects");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          t("deleteError", { defaultValue: "Failed to delete project." }),
      );
    },
  });

  const updatedAt = project.updatedAt ? new Date(project.updatedAt) : null;
  const updatedAbsolute = updatedAt
    ? updatedAt.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;
  const updatedRelative = updatedAt
    ? formatDistanceToNow(updatedAt, { addSuffix: true })
    : null;

  const headerActions = updatedRelative ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
          aria-label={
            updatedAbsolute
              ? t("lastUpdatedAt", {
                  defaultValue: "Last updated {date}",
                  date: updatedAbsolute,
                })
              : undefined
          }
        >
          <Clock className="size-3" />
          {t("lastUpdated", {
            defaultValue: "Updated {when}",
            when: updatedRelative,
          })}
        </span>
      </TooltipTrigger>
      {updatedAbsolute ? <TooltipContent>{updatedAbsolute}</TooltipContent> : null}
    </Tooltip>
  ) : null;

  const showDanger =
    permissions.canEditProject || permissions.canDeleteProject;

  const navItems = [
    {
      href: "#settings-overview",
      label: t("navOverview", { defaultValue: "Overview" }),
      icon: LayoutGrid,
    },
    ...(permissions.canEdit
      ? [
          {
            href: "#settings-workflow",
            label: t("navWorkflow", { defaultValue: "Workflow" }),
            icon: Columns3,
          },
        ]
      : []),
    ...(permissions.canManageTaskStatuses
      ? [
          {
            href: "#settings-statuses",
            label: t("navStatuses", { defaultValue: "Statuses" }),
            icon: ListChecks,
          },
        ]
      : []),
    ...(permissions.canManageLabels
      ? [
          {
            href: "#settings-labels",
            label: t("navLabels", { defaultValue: "Labels" }),
            icon: Tag,
          },
        ]
      : []),
    ...(showDanger
      ? [
          {
            href: "#settings-danger",
            label: t("navDanger", { defaultValue: "Danger zone" }),
            icon: AlertTriangle,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeaderStrip
        icon={SettingsIcon}
        title={
          <span className="flex items-center gap-2">
            <span className="truncate">{project.name}</span>
          </span>
        }
        description={t("subtitle", {
          defaultValue:
            "Manage project information, workflow, labels and lifecycle.",
        })}
        metrics={[
          project.isArchived
            ? {
                icon: Archive,
                label: t("archivedBadge", { defaultValue: "Archived" }),
                tone: "muted",
              }
            : {
                icon: ShieldCheck,
                label: t("activeBadge", { defaultValue: "Active" }),
                tone: "info",
              },
        ]}
        actions={headerActions}
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] xl:gap-10">
        <SettingsSectionNav
          items={navItems}
          title={t("navTitle", { defaultValue: "On this page" })}
          ariaLabel={t("navAria", {
            defaultValue: "Jump to settings section",
          })}
        />

        <div className="min-w-0 space-y-10 pt-1 lg:pt-0">
          <section id="settings-overview" className="scroll-mt-28 space-y-6">
            <ProjectSettings project={project} />
          </section>

          {permissions.canEdit ? (
            <section id="settings-workflow" className="scroll-mt-28 space-y-6">
              <KanbanSettingsForm projectId={project.id} />
            </section>
          ) : null}

          {permissions.canManageTaskStatuses ? (
            <section id="settings-statuses" className="scroll-mt-28 space-y-6">
              <TaskStatusesManager projectId={project.id} />
            </section>
          ) : null}

          {permissions.canManageLabels ? (
            <section id="settings-labels" className="scroll-mt-28 space-y-6">
              <TaskLabelsManager projectId={project.id} />
            </section>
          ) : null}

          {showDanger ? (
            <section id="settings-danger" className="scroll-mt-28 space-y-6">
              <Card className="border-destructive/40 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    {t("dangerZone", { defaultValue: "Danger zone" })}
                  </CardTitle>
                  <CardDescription>
                    {t("dangerZoneHint", {
                      defaultValue:
                        "Archive, restore or permanently delete this project. These actions affect everyone with access.",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {permissions.canEditProject ? (
                    <Item variant="outline" className="bg-card">
                      <ItemMedia variant="icon" className="bg-muted">
                        {project.isArchived ? (
                          <ArchiveRestore className="size-4" />
                        ) : (
                          <Archive className="size-4" />
                        )}
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>
                          {project.isArchived
                            ? t("restoreTitle", { defaultValue: "Restore project" })
                            : t("archiveTitle", { defaultValue: "Archive project" })}
                        </ItemTitle>
                        <ItemDescription>
                          {project.isArchived
                            ? t("restoreDescription", {
                                defaultValue:
                                  "Bring this project back into the active workspace.",
                              })
                            : t("archiveDescription", {
                                defaultValue:
                                  "Hide the project from active views without deleting it.",
                              })}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button
                          variant="outline"
                          onClick={() => setShowArchiveDialog(true)}
                          disabled={archiveMutation.isPending}
                        >
                          {project.isArchived
                            ? t("restore", { defaultValue: "Restore" })
                            : t("archive", { defaultValue: "Archive" })}
                        </Button>
                      </ItemActions>
                    </Item>
                  ) : null}

                  {permissions.canDeleteProject ? (
                    <Item
                      variant="outline"
                      className="border-destructive/40 bg-destructive/5"
                    >
                      <ItemMedia
                        variant="icon"
                        className="bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="text-destructive">
                          {t("deleteTitle", { defaultValue: "Delete project" })}
                        </ItemTitle>
                        <ItemDescription>
                          {t("deleteDescription", {
                            defaultValue:
                              "This permanently removes the project, its tasks, sprints, epics and reminders. This cannot be undone.",
                          })}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteDialog(true)}
                          disabled={deleteMutation.isPending}
                        >
                          {t("delete", { defaultValue: "Delete" })}
                        </Button>
                      </ItemActions>
                    </Item>
                  ) : null}
                </CardContent>
              </Card>
            </section>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        tone="info"
        icon={project.isArchived ? ArchiveRestore : Archive}
        title={
          project.isArchived
            ? t("restoreTitle", { defaultValue: "Restore project" })
            : t("archiveTitle", { defaultValue: "Archive project" })
        }
        description={
          project.isArchived
            ? t("confirmRestore", {
                defaultValue: "Restore this project to the active workspace?",
              })
            : t("confirmArchive", {
                defaultValue: "Archive this project? You can restore it later.",
              })
        }
        confirmLabel={
          project.isArchived
            ? t("restore", { defaultValue: "Restore" })
            : t("archive", { defaultValue: "Archive" })
        }
        isPending={archiveMutation.isPending}
        onConfirm={() => {
          archiveMutation.mutate();
          setShowArchiveDialog(false);
        }}
        onCancel={() => setShowArchiveDialog(false)}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        tone="destructive"
        icon={Trash2}
        title={t("deleteTitle", { defaultValue: "Delete project" })}
        description={t("confirmDelete", {
          defaultValue:
            "This action is irreversible. Type the project name to confirm in your mind, then click delete.",
        })}
        confirmLabel={t("delete", { defaultValue: "Delete" })}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate();
          setShowDeleteDialog(false);
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

export default ProjectSettingsTab;
