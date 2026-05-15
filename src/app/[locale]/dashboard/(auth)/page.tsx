"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Star,
  TimerReset,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

import Loading from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/modules/projects/components/shared/metric-card";
import {
  Avatar,
  AvatarFallback,
  AvatarIndicator,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import {
  useEmployeeAnalyticsSummary,
  useEmployeeProductivityMetrics,
  useExecutiveAnalyticsOverview,
} from "@/modules/analytics/hooks/use-analytics";
import ReminderCard from "@/modules/reminders/components/reminder-card";
import { useMyReminders } from "@/modules/reminders/hooks/use-reminders";
import { retrieveProjects } from "@/modules/projects/services";
import {
  projectStatusClasses,
  projectTypeClasses,
  businessUnitClasses,
  businessUnitFallbackClasses,
  businessUnitNamed,
} from "@/modules/projects/utils/badges/project-badges";
import type { ProjectType } from "@/modules/projects/types/projects";

// ─── Time progress helpers ────────────────────────────────────────────────────
function computeTimeProgress(
  start?: Date | null,
  end?: Date | null,
  isCompleted?: boolean,
): number {
  if (isCompleted) return 100;
  if (!start || !end) return 0;
  const now = Date.now();
  if (now < start.getTime()) return 0;
  if (now > end.getTime()) return 100;
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 100;
  return Math.round(((now - start.getTime()) / total) * 100);
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  fillClass?: string;
  trackClass?: string;
  className?: string;
}

function CircularProgress({
  value,
  size = 36,
  strokeWidth = 3,
  fillClass = "stroke-current pm-progress-ring-mid",
  trackClass = "stroke-current pm-progress-ring-track",
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-label={`${Math.round(clamped)}%`}
      role="img"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn(
            fillClass,
            "transition-[stroke-dashoffset] duration-300",
          )}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold tabular-nums">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

function getMemberInitials(memberName?: string, userName?: string): string {
  return getInitials(memberName || userName || "?");
}

// ─── Recent project list item ────────────────────────────────────────────────
function RecentProjectItem({ project }: { project: ProjectType }) {
  const t = useTranslations("modules.projects.project");

  const startDate = project.startTime ? new Date(project.startTime) : null;
  const endDate = project.endTime ? new Date(project.endTime) : null;
  const isCompleted = project.status === "Completed";
  const progress = computeTimeProgress(startDate, endDate, isCompleted);
  const overdue =
    !!endDate && !isCompleted && Date.now() > endDate.getTime();

  // Precision Utilitarian palette: indigo progression, emerald at completion,
  // destructive only when overdue.
  const fillClass = overdue
    ? "stroke-current pm-progress-ring-overdue"
    : isCompleted
      ? "stroke-current pm-progress-ring-complete"
      : progress >= 80
        ? "stroke-current pm-progress-ring-late"
        : progress >= 40
          ? "stroke-current pm-progress-ring-mid"
          : "stroke-current pm-progress-ring-early";

  const statusCls =
    projectStatusClasses[project.status] ?? projectStatusClasses["Pending"];
  const typeCls =
    projectTypeClasses[project.projectType] ?? projectTypeClasses["AGILE"];
  const buCls = project.businessUnit
    ? businessUnitClasses[project.businessUnit] ?? businessUnitFallbackClasses
    : businessUnitFallbackClasses;
  const buLabel = project.businessUnit
    ? businessUnitNamed[project.businessUnit] ?? project.businessUnit
    : "";

  const visibleMembers = (project.members ?? []).slice(0, 3);
  const totalMembers =
    project.memberCount ?? project.members?.length ?? 0;
  const remainingMembers = Math.max(0, totalMembers - visibleMembers.length);

  const description =
    project.description?.trim() ||
    project.contents?.[0]?.description?.trim() ||
    "";

  const dateRange =
    startDate && endDate
      ? `${format(startDate, "MMM d")} → ${format(endDate, "MMM d, yyyy")}`
      : startDate
        ? format(startDate, "MMM d, yyyy")
        : endDate
          ? format(endDate, "MMM d, yyyy")
          : null;

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className={cn(
        "group relative block rounded-xl border bg-card p-3 transition-all",
        "hover:bg-muted/40 hover:shadow-sm hover:-translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        project.isArchived && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Initials tile, tinted by business unit */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold",
            buCls,
          )}
          aria-hidden="true"
        >
          {getInitials(project.name)}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Title row */}
          <div className="flex items-center gap-1.5">
            <h3 className="min-w-0 truncate text-sm font-semibold leading-tight">
              {project.name}
            </h3>
            {project.isFavorite ? (
              <Star
                className="size-3.5 shrink-0 fill-primary text-primary"
                aria-label="Favorite"
              />
            ) : null}
            {project.isArchived ? (
              <Badge
                variant="outline"
                className="h-4 px-1 text-[9px] font-normal text-muted-foreground"
              >
                {t("badges.archived", { defaultValue: "Archived" })}
              </Badge>
            ) : null}
          </div>

          {/* Description */}
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {description ||
              t("details.noDescriptionShort", {
                defaultValue: "No description",
              })}
          </p>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <Badge
              variant="outline"
              className={cn("h-5 px-1.5 text-[10px] font-medium", statusCls)}
            >
              <span
                className={cn(
                  "mr-1 inline-block size-1.5 rounded-full",
                  project.status === "Running"
                    ? "pm-dot-project-running"
                    : project.status === "Completed"
                      ? "pm-dot-project-completed"
                      : project.status === "Stopped"
                        ? "pm-dot-project-stopped"
                        : "pm-dot-project-pending",
                )}
              />
              {project.status}
            </Badge>
            <Badge
              variant="outline"
              className={cn("h-5 px-1.5 text-[10px] font-medium", typeCls)}
            >
              {project.projectType}
            </Badge>
            {buLabel ? (
              <Badge
                variant="outline"
                className={cn("h-5 px-1.5 text-[10px] font-medium", buCls)}
              >
                {buLabel}
              </Badge>
            ) : null}
            {dateRange ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px]",
                  overdue ? "text-destructive" : "text-muted-foreground",
                )}
              >
                <Calendar className="size-2.5" />
                {dateRange}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right rail: members + progress + arrow */}
        <div className="flex shrink-0 items-center gap-3 self-center">
          {totalMembers > 0 ? (
            <TooltipProvider delayDuration={120}>
              <div
                className="flex -space-x-1.5"
                aria-label={`${totalMembers} members`}
              >
                {visibleMembers.map((member) => {
                  const name =
                    member.memberName || member.user?.name || "Member";
                  return (
                    <Tooltip key={member.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="size-6 border bg-background text-[10px]">
                          <AvatarFallback className="text-[10px] font-semibold">
                            {getMemberInitials(
                              member.memberName,
                              member.user?.name,
                            )}
                          </AvatarFallback>
                          {member.isManager ? (
                            <AvatarIndicator
                              variant="success"
                              position="bottom-end"
                              aria-label="Project manager"
                            />
                          ) : null}
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{name}</TooltipContent>
                    </Tooltip>
                  );
                })}
                {remainingMembers > 0 ? (
                  <span
                    className="flex size-6 items-center justify-center rounded-full border bg-muted text-[10px] font-semibold text-muted-foreground"
                    aria-label={`${remainingMembers} more members`}
                  >
                    +{remainingMembers}
                  </span>
                ) : null}
              </div>
            </TooltipProvider>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="size-3" /> 0
            </span>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <CircularProgress
                  value={progress}
                  size={36}
                  fillClass={fillClass}
                  trackClass="stroke-current pm-progress-ring-track"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {overdue
                ? t("details.overdue", { defaultValue: "Overdue" })
                : `${progress}% ${t("details.timeProgress", { defaultValue: "time elapsed" })}`}
            </TooltipContent>
          </Tooltip>

          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardHomePage() {
  const t = useTranslations("shared.welcome");
  const { user, isLoading } = useCurrentUser();
  const overviewQuery = useExecutiveAnalyticsOverview();
  const employeeSummaryQuery = useEmployeeAnalyticsSummary(user?.id);
  const employeeProductivityQuery = useEmployeeProductivityMetrics(user?.id);
  const remindersQuery = useMyReminders({
    status: "PENDING",
    page: 1,
    limit: 5,
    sortBy: "reminderAtAsc",
  });
  const projectsQuery = useQuery({
    queryKey: ["dashboard-recent-projects"],
    queryFn: () =>
      retrieveProjects({
        page: 1,
        limit: 6,
        sortBy: "createdAtDesc",
      }),
    refetchOnWindowFocus: false,
  });

  const isExecutive = user?.roles.some((role) =>
    ["ceo", "cto", "cmo"].includes(String(role)),
  );
  const reminderItems = useMemo(
    () => remindersQuery.data?.data ?? [],
    [remindersQuery.data?.data],
  );
  const recentProjects = useMemo(
    () => projectsQuery.data?.data ?? [],
    [projectsQuery.data?.data],
  );

  const activeRecent = recentProjects.filter((p) => !p.isArchived).length;

  if (isLoading) {
    return <Loading />;
  }

  const fullName = user?.name || "Teammate";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-chart-2/10 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {t("companyDefault", { defaultValue: "Tawer Management" })}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("welcome", {
                name: firstName,
                defaultValue: `Welcome, ${firstName}`,
              })}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Your workspace is now backed by live project, reminder, sprint,
              and analytics data from the backend.
            </p>
          </div>

          <div className="flex gap-3">
            <Button asChild>
              <Link href="/dashboard/projects">
                <Briefcase className="mr-2 size-4" />
                Open projects
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/reminders">
                <Bell className="mr-2 size-4" />
                View reminders
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {isExecutive ? (
          <>
            <MetricCard
              icon={FolderKanban}
              label="Projects in scope"
              value={overviewQuery.data?.totalProjects ?? 0}
              tone="primary"
              loading={overviewQuery.isLoading}
            />
            <MetricCard
              icon={TimerReset}
              label="Open tasks"
              value={overviewQuery.data?.openTasks ?? 0}
              tone="running"
              loading={overviewQuery.isLoading}
            />
            <MetricCard
              icon={CheckCircle2}
              label="Completed tasks"
              value={overviewQuery.data?.completedTasks ?? 0}
              tone="success"
              loading={overviewQuery.isLoading}
            />
            <MetricCard
              icon={Briefcase}
              label="Active sprints"
              value={overviewQuery.data?.activeSprints ?? 0}
              tone="info"
              loading={overviewQuery.isLoading}
            />
          </>
        ) : (
          <>
            <MetricCard
              icon={FolderKanban}
              label="Assigned tasks"
              value={employeeSummaryQuery.data?.totalAssignedTasks ?? 0}
              tone="primary"
              loading={employeeSummaryQuery.isLoading}
            />
            <MetricCard
              icon={TimerReset}
              label="Open assigned"
              value={employeeSummaryQuery.data?.openAssignedTasks ?? 0}
              tone="running"
              loading={employeeSummaryQuery.isLoading}
            />
            <MetricCard
              icon={CheckCircle2}
              label="Completed assigned"
              value={employeeSummaryQuery.data?.completedAssignedTasks ?? 0}
              tone="success"
              loading={employeeSummaryQuery.isLoading}
            />
            <MetricCard
              icon={Briefcase}
              label="Hours logged"
              value={employeeProductivityQuery.data?.hoursLogged ?? 0}
              tone="info"
              loading={employeeProductivityQuery.isLoading}
            />
          </>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FolderKanban className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base leading-none">
                  Recent projects
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Most recently created projects in your workspace.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {recentProjects.length > 0 ? (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] font-medium"
                >
                  {activeRecent}/{recentProjects.length} active
                </Badge>
              ) : null}
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/projects">
                  View all
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {projectsQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))
            ) : recentProjects.length ? (
              recentProjects.map((project) => (
                <RecentProjectItem key={project.id} project={project} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                <FolderKanban className="size-8 text-muted-foreground/60" />
                <p className="mt-2 text-sm font-medium">No projects yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first project to see it here.
                </p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/dashboard/projects">
                    <Briefcase className="mr-2 size-3.5" />
                    Go to projects
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md pm-tone-info">
                <Bell className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base leading-none">
                  Upcoming reminders
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pending reminders due next.
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/reminders">
                View all
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {remindersQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))
            ) : reminderItems.length ? (
              reminderItems.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                <Bell className="size-8 text-muted-foreground/60" />
                <p className="mt-2 text-sm font-medium">All caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No pending reminders right now.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
