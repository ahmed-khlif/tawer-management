"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  CircleDot,
  GitCommitHorizontal,
  FolderKanban,
  MessageSquare,
  Milestone,
  Sparkles,
  Star,
  TimerReset,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { format, formatDistanceToNow } from "date-fns";

import Loading from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/modules/projects/components/shared/metric-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { API } from "@/lib/api-endpoints";

import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import {
  useEmployeeAnalyticsSummary,
  useEmployeeProductivityMetrics,
  useExecutiveAnalyticsOverview,
} from "@/modules/analytics/hooks/use-analytics";
import { useProjectActivity } from "@/modules/projects/hooks/activity/use-project-activity";
import { retrieveProjects } from "@/modules/projects/services";
import {
  PROJECT_ACTIVITY_TYPES,
  type ProjectActivityItem,
} from "@/modules/projects/types/project-activity";
import {
  projectStatusClasses,
  projectTypeClasses,
  businessUnitClasses,
  businessUnitFallbackClasses,
  businessUnitNamed,
} from "@/modules/projects/utils/badges/project-badges";
import type { ProjectType } from "@/modules/projects/types/projects";
import { canViewProjectActivity } from "@/modules/projects/utils/activity-access";
import { shouldShowOnboarding } from "@/modules/projects/utils/onboarding-state";

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

function getInitials(name?: string | null): string {
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

function getWelcomeActivityMeta(activity: ProjectActivityItem) {
  switch (activity.type) {
    case PROJECT_ACTIVITY_TYPES.TASK_COMMENT_ADDED:
    case PROJECT_ACTIVITY_TYPES.TASK_COMMENT_LIKED:
      return {
        icon: MessageSquare,
        dotClass:
          "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300",
      };
    case PROJECT_ACTIVITY_TYPES.TASK_STATUS_CHANGED:
    case PROJECT_ACTIVITY_TYPES.MILESTONE_COMPLETED:
      return {
        icon: Check,
        dotClass:
          "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
      };
    case PROJECT_ACTIVITY_TYPES.MILESTONE_CREATED:
    case PROJECT_ACTIVITY_TYPES.MILESTONE_UPDATED:
    case PROJECT_ACTIVITY_TYPES.SPRINT_CREATED:
    case PROJECT_ACTIVITY_TYPES.SPRINT_UPDATED:
      return {
        icon: Milestone,
        dotClass:
          "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300",
      };
    case PROJECT_ACTIVITY_TYPES.PROJECT_MEMBER_ADDED:
    case PROJECT_ACTIVITY_TYPES.PROJECT_MEMBER_REMOVED:
    case PROJECT_ACTIVITY_TYPES.PROJECT_INVITATION_CREATED:
    case PROJECT_ACTIVITY_TYPES.PROJECT_INVITATION_ACCEPTED:
      return {
        icon: UserPlus,
        dotClass:
          "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600 dark:border-fuchsia-900/40 dark:bg-fuchsia-950/30 dark:text-fuchsia-300",
      };
    case PROJECT_ACTIVITY_TYPES.TASK_UPDATED:
      return {
        icon: GitCommitHorizontal,
        dotClass: "border-primary/20 bg-primary/10 text-primary",
      };
    default:
      return {
        icon: CircleDot,
        dotClass:
          "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300",
      };
  }
}

function getWelcomeActivitySummary(activity: ProjectActivityItem) {
  const actorName = activity.actor.name?.trim();
  const normalized = activity.summary.replace(/^(undefined|null)\b\s*/i, "").trim();

  if (!actorName) {
    return normalized || activity.summary;
  }

  const escapedActor = actorName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return normalized.replace(new RegExp(`^${escapedActor}\\s*`, "i"), "").trim();
}

function resolveActivityActorImage(image?: string | null) {
  if (!image) return undefined;
  if (/^(https?:)?\/\//i.test(image) || image.startsWith("data:")) {
    return image;
  }
  if (image.startsWith("/static/")) {
    return `${API.BASE_URL}${image}`;
  }
  if (image.startsWith("/")) {
    return `${API.BASE_URL}${image}`;
  }

  return `${API.BASE_URL}/static/images/users/${image}`;
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
                          {member.user?.image ? (
                            <AvatarImage src={member.user.image} alt={name} />
                          ) : null}
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
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const isExecutive = user?.roles.some((role) =>
    ["ceo", "cto", "cmo"].includes(String(role)),
  );
  const canViewActivity = canViewProjectActivity(user?.roles);
  const overviewQuery = useExecutiveAnalyticsOverview(isExecutive);
  const employeeSummaryQuery = useEmployeeAnalyticsSummary(user?.id);
  const employeeProductivityQuery = useEmployeeProductivityMetrics(user?.id);
  const activityQuery = useProjectActivity(
    {
      page: 1,
      limit: 5,
    },
    canViewActivity,
  );
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
  const recentProjects = useMemo(
    () => projectsQuery.data?.data ?? [],
    [projectsQuery.data?.data],
  );
  const recentActivity = useMemo(
    () => activityQuery.data?.data ?? [],
    [activityQuery.data?.data],
  );

  const activeRecent = recentProjects.filter((p) => !p.isArchived).length;

  useEffect(() => {
    if (!isLoading && user && shouldShowOnboarding()) {
      router.replace("/dashboard/onboarding");
    }
  }, [isLoading, router, user]);

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
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border-2 border-background/80 shadow-sm">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={fullName} />
                ) : null}
                <AvatarFallback className="text-sm font-semibold">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
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
              </div>
            </div>
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
              <Link href="/dashboard/onboarding">
                <Sparkles className="mr-2 size-4" />
                View onboarding
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

        <div className="space-y-6">
          {canViewActivity ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base leading-none">
                      Recent activity
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      The latest project and team signals across your workspace.
                    </p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/activity">
                    View all
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {activityQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-4/5" />
                          <Skeleton className="h-3 w-3/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length ? (
                  <div className="space-y-1">
                    {recentActivity.map((activity, index) => {
                      const meta = getWelcomeActivityMeta(activity);
                      const Icon = meta.icon;

                      return (
                        <Link
                          key={activity.id}
                          href="/dashboard/activity"
                          className="group block rounded-xl px-1 py-2 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative flex flex-col items-center">
                              <Avatar className="size-10 border">
                                {activity.actor.image ? (
                                  <AvatarImage
                                    src={resolveActivityActorImage(activity.actor.image)}
                                    alt={activity.actor.name ?? "Actor"}
                                  />
                                ) : null}
                                <AvatarFallback className="text-[11px] font-semibold">
                                  {getInitials(activity.actor.name)}
                                </AvatarFallback>
                              </Avatar>
                              {index !== recentActivity.length - 1 ? (
                                <span className="mt-1 h-12 w-px bg-border" aria-hidden="true" />
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1 pb-3">
                              <div className="flex items-start gap-2">
                                <span
                                  className={cn(
                                    "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border",
                                    meta.dotClass,
                                  )}
                                >
                                  <Icon className="size-3.5" />
                                </span>
                                <div className="min-w-0 space-y-1">
                                  <p className="text-sm leading-5 text-foreground">
                                    <span className="font-semibold">
                                      {activity.actor.name ?? "System"}
                                    </span>{" "}
                                    {getWelcomeActivitySummary(activity)}
                                  </p>
                                  <div className="rounded-md bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                      {activity.targetLabel}
                                    </span>
                                    <span className="mx-1.5 text-muted-foreground/70">•</span>
                                    {activity.project.name}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(activity.occurredAt, {
                                      addSuffix: true,
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}

                    <div className="pt-2 text-center">
                      <Button asChild variant="ghost" size="sm" className="text-xs">
                        <Link href="/dashboard/activity">View all activity</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                    <Sparkles className="size-8 text-muted-foreground/60" />
                    <p className="mt-2 text-sm font-medium">No recent activity yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Project updates, comments, milestones, and team actions will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
