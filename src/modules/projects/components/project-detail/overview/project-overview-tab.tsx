"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isPast } from "date-fns";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Flag,
  ListTodo,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarIndicator,
} from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Crown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchProjectCapacity } from "@/modules/projects/services/api/project-capacity";
import { fetchProjectReportOverview } from "@/modules/projects/services/api/project-report";
import { useProjectReminders } from "@/modules/reminders/hooks/use-reminders";
import ReminderCard from "@/modules/reminders/components/reminder-card";
import { ProjectType } from "@/modules/projects/types/projects";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { formatUserRoleLabel } from "@/modules/projects/utils/format-user-role";
import { MetricCard, type MetricTone } from "@/modules/projects/components/shared/metric-card";
import {
  userRoleBadgeClass,
  userRoleDotClass,
  userRoleStyle,
} from "@/modules/projects/utils/badges/user-role-badges";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";

type SectionTone =
  | "primary"
  | "running"
  | "info"
  | "warning"
  | "success"
  // Legacy chart-* tones kept for backward compatibility.
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-5";

const SECTION_ICON_TONE: Record<SectionTone, string> = {
  primary: "bg-primary/10 text-primary",
  running: "pm-tone-running",
  info: "pm-tone-info",
  warning: "pm-tone-warning",
  success: "pm-tone-success",
  "chart-1": "pm-tone-running",
  "chart-2": "pm-tone-info",
  "chart-3": "pm-tone-warning",
  "chart-5": "pm-tone-success",
};

interface SectionStripProps {
  icon: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tone?: SectionTone;
  right?: React.ReactNode;
}

function SectionStrip({
  icon: Icon,
  title,
  subtitle,
  tone = "primary",
  right,
}: SectionStripProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-md shrink-0",
            SECTION_ICON_TONE[tone],
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-none">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
      {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
    </div>
  );
}

interface ProjectOverviewTabProps {
  project: ProjectType;
  permissions: ProjectPermissions;
  onChangeTab?: (tab: string) => void;
}

function buildTabHref(currentSearch: string | null, tab: string): string {
  const params = new URLSearchParams(currentSearch ?? "");
  params.set("tab", tab);
  return `?${params.toString()}`;
}

export function ProjectOverviewTab({ project, permissions, onChangeTab }: ProjectOverviewTabProps) {
  const t = useTranslations("modules.projects.project.details");
  const { user } = useCurrentUser();
  const reportQuery = useQuery({
    queryKey: ["project-report-overview", project.id],
    queryFn: () => fetchProjectReportOverview(project.id),
    enabled: !!project.id && permissions.canViewAnalytics,
  });
  const capacityQuery = useQuery({
    queryKey: ["project-capacity", project.id],
    queryFn: () => fetchProjectCapacity(project.id),
    enabled: !!project.id && permissions.canViewAnalytics,
  });
  const remindersQuery = useProjectReminders(project.id, {
    status: "PENDING",
    limit: 5,
    sortBy: "reminderAtAsc",
  });

  const report = reportQuery.data;
  const capacity = capacityQuery.data;

  const upcomingReminders = useMemo(() => {
    const allReminders = remindersQuery.data?.data ?? [];
    // For project reminders, filter to only show current user's reminders
    // unless the user has full reminder management permissions (can edit any reminder)
    if (user && permissions.canEditAnyReminder) {
      // User can see all reminders
      return allReminders;
    } else if (user) {
      // User can only see their own reminders
      return allReminders.filter(reminder => reminder.user?.id === user.id);
    } else {
      // No user, show no reminders
      return [];
    }
  }, [remindersQuery.data?.data, user, permissions.canEditAnyReminder]);

  const totalTasks = report?.totalTasks ?? 0;
  const completedTasks = report?.completedTasks ?? 0;
  const overdueTasks = report?.overdueTasks ?? 0;
  const milestonesDone = report?.milestones.completed ?? 0;
  const milestonesTotal = report?.milestones.total ?? 0;

  const kpis: Array<{
    key: string;
    label: string;
    value: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
    tab: string;
    tone: MetricTone;
    hint?: string;
    progress?: number;
    emphasize?: boolean;
  }> = [
    {
      key: "totalTasks",
      label: t("overview.totalTasks", { defaultValue: "Total tasks" }),
      value: totalTasks,
      icon: ListTodo,
      tab: "board",
      tone: "primary",
    },
    {
      key: "completed",
      label: t("overview.completedTasks", { defaultValue: "Completed" }),
      value: completedTasks,
      icon: CheckCircle2,
      tab: "board",
      tone: "success",
      hint:
        totalTasks > 0
          ? `${Math.round((completedTasks / totalTasks) * 100)}% of total`
          : undefined,
      progress:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : undefined,
    },
    {
      key: "overdue",
      label: t("overview.overdue", { defaultValue: "Overdue" }),
      value: overdueTasks,
      icon: AlertTriangle,
      tab: "board",
      tone: overdueTasks > 0 ? "destructive" : "default",
      emphasize: overdueTasks > 0,
    },
    {
      key: "activeSprints",
      label: t("overview.activeSprints", { defaultValue: "Active sprints" }),
      value: report?.activeSprints ?? 0,
      icon: Sparkles,
      tab: "sprints",
      tone: "running",
    },
    {
      key: "milestones",
      label: t("overview.milestones", { defaultValue: "Milestones" }),
      value: `${milestonesDone}/${milestonesTotal}`,
      icon: Flag,
      tab: "milestones",
      tone: "info",
      progress:
        milestonesTotal > 0
          ? Math.round((milestonesDone / milestonesTotal) * 100)
          : undefined,
    },
    {
      key: "members",
      label: t("overview.members", { defaultValue: "Members" }),
      value: project.members?.length ?? project.memberCount ?? 0,
      icon: Users,
      tab: "members",
      tone: "default",
    },
  ];

  const completionPercent = Math.round(report?.completionPercent ?? 0);
  const milestonePercent = Math.round(report?.milestones.completionPercent ?? 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <MetricCard
            key={kpi.key}
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
            emphasize={kpi.emphasize}
            progress={kpi.progress}
            loading={reportQuery.isLoading}
            onClick={onChangeTab ? () => onChangeTab(kpi.tab) : undefined}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <SectionStrip
              icon={BarChart3}
              tone="running"
              title={t("overview.progress", { defaultValue: "Progress" })}
              subtitle={t("overview.progressSubtitle", {
                defaultValue: "Tasks and milestones completion at a glance.",
              })}
              right={
                <Badge variant="outline" className="font-normal">
                  {completionPercent}%
                </Badge>
              }
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {reportQuery.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("overview.taskCompletion", { defaultValue: "Task completion" })}</span>
                    <span className="font-medium">{completionPercent}%</span>
                  </div>
                  <Progress value={completionPercent} />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("overview.milestoneCompletion", { defaultValue: "Milestone completion" })}</span>
                    <span className="font-medium">{milestonePercent}%</span>
                  </div>
                  <Progress value={milestonePercent} />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="size-3" />
                    {format(project.startTime, "MMM d, yyyy")}
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant={isPast(project.endTime) && project.status !== "Completed" ? "destructive" : "outline"} className="gap-1">
                    <Calendar className="size-3" />
                    {format(project.endTime, "MMM d, yyyy")}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionStrip
              icon={Users}
              tone="info"
              title={t("overview.capacity", { defaultValue: "Team capacity" })}
              subtitle={t("overview.capacitySubtitle", {
                defaultValue: "Committed vs available story points across active sprints.",
              })}
              right={
                capacity ? (
                  <Badge
                    variant={
                      capacity.riskLevel === "HIGH"
                        ? "destructive"
                        : capacity.riskLevel === "MEDIUM"
                          ? "secondary"
                          : "outline"
                    }
                    className="font-normal"
                  >
                    {t(`overview.risk.${capacity.riskLevel.toLowerCase()}`, {
                      defaultValue: capacity.riskLevel,
                    })}
                  </Badge>
                ) : null
              }
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {capacityQuery.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : capacity ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("overview.committed", { defaultValue: "Committed points" })}</span>
                  <span className="font-medium">
                    {capacity.totalCommittedPoints} / {capacity.totalCapacityPoints}
                  </span>
                </div>
                <Progress
                  value={
                    capacity.totalCapacityPoints
                      ? Math.min(100, Math.round((capacity.totalCommittedPoints / capacity.totalCapacityPoints) * 100))
                      : 0
                  }
                />
                <p className="text-sm text-muted-foreground">
                  {capacity.activeSprints} {t("overview.activeSprints", { defaultValue: "Active sprints" })}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("overview.noCapacity", { defaultValue: "No active sprints; capacity will appear when a sprint is running." })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <SectionStrip
              icon={Bell}
              tone="warning"
              title={t("overview.upcomingReminders", {
                defaultValue: "Upcoming reminders",
              })}
              subtitle={t("overview.upcomingRemindersSubtitle", {
                defaultValue:
                  "Pending reminders for this project — same rich cards as your dashboard.",
              })}
              right={
                <>
                  {upcomingReminders.length > 0 ? (
                    <Badge variant="outline" className="font-normal">
                      {upcomingReminders.length}
                    </Badge>
                  ) : null}
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={buildTabHref(
                        typeof window !== "undefined"
                          ? window.location.search.slice(1)
                          : "",
                        "reminders",
                      )}
                    >
                      {t("overview.viewAll", { defaultValue: "View all" })}
                    </Link>
                  </Button>
                </>
              }
            />
          </CardHeader>
          <CardContent>
            {remindersQuery.isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : upcomingReminders.length === 0 ? (
              <Empty className="border-dashed border bg-muted/30 py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Bell className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {t("overview.noReminders", {
                      defaultValue: "No upcoming reminders.",
                    })}
                  </EmptyTitle>
                  <EmptyDescription>
                    {t("overview.noRemindersHint", {
                      defaultValue:
                        "Create reminders to stay on top of upcoming deadlines.",
                    })}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionStrip
              icon={Users}
              tone="success"
              title={t("overview.team", { defaultValue: "Team" })}
              subtitle={t("overview.teamSubtitle", {
                defaultValue: "Members with access to this project.",
              })}
              right={
                <>
                  <Badge variant="outline" className="font-normal">
                    {project.members?.length ?? 0}
                  </Badge>
                  {(project.members?.length ?? 0) > 5 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onChangeTab?.("members")}
                    >
                      {t("overview.viewAll", { defaultValue: "View all" })}
                    </Button>
                  ) : null}
                </>
              }
            />
          </CardHeader>
          <CardContent>
            {(project.members ?? []).length === 0 ? (
              <Empty className="border-dashed border bg-muted/30 py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {t("overview.noMembers", { defaultValue: "No members yet." })}
                  </EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-2">
                {(project.members ?? []).slice(0, 5).map((member) => {
                  const displayName =
                    member.memberName || member.user?.name || member.userId;
                  const initials =
                    displayName
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((s: string) => s[0]?.toUpperCase() ?? "")
                      .join("") || "?";
                  return (
                    <HoverCard
                      key={member.id}
                      openDelay={120}
                      closeDelay={80}
                    >
                      <HoverCardTrigger asChild>
                        <Item
                          variant="outline"
                          size="sm"
                          className="bg-card hover:bg-muted/40 transition-colors cursor-default"
                        >
                          <ItemMedia>
                            <Avatar className="size-8 border bg-muted">
                              <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                                {initials}
                              </AvatarFallback>
                              {member.isManager ? (
                                <AvatarIndicator
                                  variant="success"
                                  position="bottom-end"
                                />
                              ) : null}
                            </Avatar>
                          </ItemMedia>
                          <ItemContent className="min-w-0">
                            <ItemTitle className="truncate flex items-center gap-1.5">
                              <span className="truncate">{displayName}</span>
                              {member.isManager ? (
                                <Crown className="size-3 shrink-0 text-primary" />
                              ) : null}
                            </ItemTitle>
                            {(member.userRoles ?? []).length > 0 ? (
                              <ItemDescription className="flex flex-wrap items-center gap-1">
                                {(member.userRoles ?? []).map((role) => (
                                  <Badge
                                    key={role}
                                    variant="outline"
                                    className={cn(
                                      "h-4 gap-1 px-1.5 text-[9px] font-medium",
                                      userRoleBadgeClass(),
                                    )}
                                    style={userRoleStyle(role)}
                                    title={role}
                                  >
                                    <span
                                      className={userRoleDotClass()}
                                      aria-hidden
                                    />
                                    {formatUserRoleLabel(role)}
                                  </Badge>
                                ))}
                              </ItemDescription>
                            ) : null}
                          </ItemContent>
                          <ItemActions>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 text-[10px] font-medium",
                                member.isManager
                                  ? "pm-tone-success border"
                                  : "border-muted-foreground/25 bg-muted/50 text-muted-foreground",
                              )}
                            >
                              {member.isManager
                                ? t("membersList.manager", {
                                    defaultValue: "Manager",
                                  })
                                : t("membersList.member", {
                                    defaultValue: "Member",
                                  })}
                            </Badge>
                          </ItemActions>
                        </Item>
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="w-64 p-3"
                        align="end"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="size-10 border bg-muted">
                            <AvatarFallback className="text-sm font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="font-semibold text-sm leading-tight truncate">
                              {displayName}
                            </span>
                            {member.user?.email ? (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground truncate">
                                <Mail className="size-3 shrink-0" />
                                {member.user.email}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProjectOverviewTab;
