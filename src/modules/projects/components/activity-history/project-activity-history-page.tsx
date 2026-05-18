"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import {
  Activity,
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Download,
  FileDown,
  FileSpreadsheet,
  Filter,
  FolderKanban,
  Layers3,
  MessageSquare,
  Milestone,
  RefreshCw,
  Rocket,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

import CalendarDateRangePicker from "@/components/custom-date-range-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportMenuButton } from "@/components/export-menu-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { exportReportToPdfPrintWindow, exportRowsToCsv } from "@/lib/report-export";
import AccessDenied from "@/components/error/access-denied";
import { MetricCard } from "@/modules/projects/components/shared/metric-card";
import { useProjectActivity } from "@/modules/projects/hooks/activity/use-project-activity";
import { retrieveAllProjects } from "@/modules/projects/services";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { canExportProjectActivity, canViewProjectActivity } from "@/modules/projects/utils/activity-access";
import {
  PROJECT_ACTIVITY_TYPES,
  type ProjectActivityFilters,
  type ProjectActivityItem,
  type ProjectActivityType,
} from "@/modules/projects/types/project-activity";
import { fetchAllProjectActivity } from "@/modules/projects/services/api/project-activity";
import { API } from "@/lib/api-endpoints";

const TYPE_OPTIONS: Array<{ value: ProjectActivityType; label: string }> = [
  { value: PROJECT_ACTIVITY_TYPES.TASK_CREATED, label: "Task created" },
  { value: PROJECT_ACTIVITY_TYPES.TASK_UPDATED, label: "Task updated" },
  { value: PROJECT_ACTIVITY_TYPES.TASK_STATUS_CHANGED, label: "Task status changed" },
  { value: PROJECT_ACTIVITY_TYPES.TASK_COMMENT_ADDED, label: "Comments" },
  { value: PROJECT_ACTIVITY_TYPES.TASK_COMMENT_LIKED, label: "Comment likes" },
  { value: PROJECT_ACTIVITY_TYPES.SPRINT_CREATED, label: "Sprint created" },
  { value: PROJECT_ACTIVITY_TYPES.SPRINT_UPDATED, label: "Sprint updated" },
  { value: PROJECT_ACTIVITY_TYPES.EPIC_CREATED, label: "Epic created" },
  { value: PROJECT_ACTIVITY_TYPES.EPIC_UPDATED, label: "Epic updated" },
  { value: PROJECT_ACTIVITY_TYPES.MILESTONE_CREATED, label: "Milestone created" },
  { value: PROJECT_ACTIVITY_TYPES.MILESTONE_UPDATED, label: "Milestone updated" },
  { value: PROJECT_ACTIVITY_TYPES.MILESTONE_COMPLETED, label: "Milestone completed" },
  { value: PROJECT_ACTIVITY_TYPES.REMINDER_CREATED, label: "Reminder created" },
  { value: PROJECT_ACTIVITY_TYPES.REMINDER_CANCELLED, label: "Reminder cancelled" },
  { value: PROJECT_ACTIVITY_TYPES.REMINDER_DISMISSED, label: "Reminder dismissed" },
  { value: PROJECT_ACTIVITY_TYPES.PROJECT_MEMBER_ADDED, label: "Member added" },
  { value: PROJECT_ACTIVITY_TYPES.PROJECT_MEMBER_REMOVED, label: "Member removed" },
  { value: PROJECT_ACTIVITY_TYPES.PROJECT_INVITATION_CREATED, label: "Invitation sent" },
  { value: PROJECT_ACTIVITY_TYPES.PROJECT_INVITATION_ACCEPTED, label: "Invitation accepted" },
];

function getInitials(name?: string | null) {
  if (!name) return "-";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase() || "-"
  );
}

function getDayLabel(date: Date) {
  if (isToday(date)) return `Today - ${format(date, "MMM d")}`;
  if (isYesterday(date)) return `Yesterday - ${format(date, "MMM d")}`;
  return format(date, "EEEE, MMM d");
}

function getActivityMeta(activity: ProjectActivityItem) {
  switch (activity.type) {
    case PROJECT_ACTIVITY_TYPES.TASK_COMMENT_ADDED:
    case PROJECT_ACTIVITY_TYPES.TASK_COMMENT_LIKED:
      return {
        icon: MessageSquare,
        color: "text-sky-600",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
      };
    case PROJECT_ACTIVITY_TYPES.TASK_STATUS_CHANGED:
      return {
        icon: RefreshCw,
        color: "text-amber-600",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    case PROJECT_ACTIVITY_TYPES.SPRINT_CREATED:
    case PROJECT_ACTIVITY_TYPES.SPRINT_UPDATED:
      return {
        icon: Rocket,
        color: "text-violet-600",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
      };
    case PROJECT_ACTIVITY_TYPES.EPIC_CREATED:
    case PROJECT_ACTIVITY_TYPES.EPIC_UPDATED:
      return {
        icon: Layers3,
        color: "text-indigo-600",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
      };
    case PROJECT_ACTIVITY_TYPES.MILESTONE_CREATED:
    case PROJECT_ACTIVITY_TYPES.MILESTONE_UPDATED:
    case PROJECT_ACTIVITY_TYPES.MILESTONE_COMPLETED:
      return {
        icon: Milestone,
        color: "text-emerald-600",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    case PROJECT_ACTIVITY_TYPES.REMINDER_CREATED:
    case PROJECT_ACTIVITY_TYPES.REMINDER_CANCELLED:
    case PROJECT_ACTIVITY_TYPES.REMINDER_DISMISSED:
      return {
        icon: Bell,
        color: "text-rose-600",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
      };
    case PROJECT_ACTIVITY_TYPES.PROJECT_MEMBER_ADDED:
    case PROJECT_ACTIVITY_TYPES.PROJECT_MEMBER_REMOVED:
    case PROJECT_ACTIVITY_TYPES.PROJECT_INVITATION_CREATED:
    case PROJECT_ACTIVITY_TYPES.PROJECT_INVITATION_ACCEPTED:
      return {
        icon: UserPlus,
        color: "text-fuchsia-600",
        bg: "bg-fuchsia-500/10",
        border: "border-fuchsia-500/20",
      };
    default:
      return {
        icon: Activity,
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
      };
  }
}

function getActivitySummary(activity: ProjectActivityItem) {
  const actorName = activity.actor.name?.trim();
  const normalized = activity.summary.replace(/^(undefined|null)\b\s*/i, "").trim();

  if (!actorName) {
    return normalized || activity.summary;
  }

  const escapedActor = actorName.replace(/[.*+-^${}()|[\]\\]/g, "\\$&");
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

function buildActivityHref(activity: ProjectActivityItem) {
  const projectBase = `/dashboard/projects/${activity.project.id}`;

  switch (activity.targetType) {
    case "TASK":
    case "TASK_COMMENT":
      return `${projectBase}?tab=tasks&sub=board${
        activity.targetId ? `&taskId=${activity.metadata?.taskId ?? activity.targetId}` : ""
      }`;
    case "SPRINT":
      return `${projectBase}?tab=planning&sub=sprints${
        activity.targetId ? `&sprintId=${activity.targetId}` : ""
      }`;
    case "EPIC":
      return `${projectBase}?tab=planning&sub=epics${
        activity.targetId ? `&epicId=${activity.targetId}` : ""
      }`;
    case "MILESTONE":
      return `${projectBase}?tab=planning&sub=milestones${
        activity.targetId ? `&milestoneId=${activity.targetId}` : ""
      }`;
    case "REMINDER":
      return "/dashboard/reminders";
    default:
      return projectBase;
  }
}

function FilterPanel({
  values,
  onChange,
  onDateRangeChange,
  projectOptions,
}: {
  values: {
    search: string;
    projectId: string;
    actorName: string;
    type: string;
    startDate: string;
    endDate: string;
  };
  onChange: (key: keyof typeof values, value: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  projectOptions: Array<{ id: string; name: string }>;
}) {
  const selectedDateRange =
    values.startDate || values.endDate
      ? {
          from: values.startDate ? new Date(`${values.startDate}T00:00:00`) : undefined,
          to: values.endDate ? new Date(`${values.endDate}T23:59:59`) : undefined,
        }
      : undefined;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Search
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={values.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="Search task, project, actor, summary..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Date range
        </div>
        <CalendarDateRangePicker
          value={selectedDateRange}
          onRangeChange={onDateRangeChange}
          className="w-full"
          placeholder="Filter by date range"
        />
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Activity type
        </div>
        <Select
          value={values.type || "__all__"}
          onValueChange={(value) => onChange("type", value === "__all__" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All activity</SelectItem>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground">{TYPE_OPTIONS.length} event types available</div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Project
        </div>
        <Select
          value={values.projectId || "__all__"}
          onValueChange={(value) => onChange("projectId", value === "__all__" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All projects</SelectItem>
            {projectOptions.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Team member
        </div>
        <Input
          value={values.actorName}
          onChange={(event) => onChange("actorName", event.target.value)}
          placeholder="Filter by actor name"
        />
      </div>
    </div>
  );
}

export default function ProjectActivityHistoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();
  const [exporting, setExporting] = useState<null | "csv" | "pdf">(null);

  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const projectId = searchParams.get("projectId") || "";
  const actorName = searchParams.get("actorName") || "";
  const type = searchParams.get("type") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const filters: ProjectActivityFilters = {
    page,
    limit: 20,
    search: search || undefined,
    actorName: actorName || undefined,
    projectIds: projectId ? [projectId] : undefined,
    types: type ? [type as ProjectActivityType] : undefined,
    startDateFrom: startDate ? new Date(`${startDate}T00:00:00`).toISOString() : undefined,
    endDateTo: endDate ? new Date(`${endDate}T23:59:59`).toISOString() : undefined,
  };

  const canView = canViewProjectActivity(user?.roles);
  const canExport = canExportProjectActivity(user?.roles);
  const activityQuery = useProjectActivity(filters, canView);
  const projectsQuery = useQuery({
    queryKey: ["activity-filter-projects"],
    queryFn: async () =>
      retrieveAllProjects({ sortBy: "createdAtDesc", isArchived: false }),
    enabled: canView,
  });

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const setDateRange = (range: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());

    if (range?.from) {
      params.set("startDate", format(range.from, "yyyy-MM-dd"));
    } else {
      params.delete("startDate");
    }

    if (range?.to) {
      params.set("endDate", format(range.to, "yyyy-MM-dd"));
    } else {
      params.delete("endDate");
    }

    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const changePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const grouped = useMemo(() => {
    const items = activityQuery.data?.data ?? [];
    const map = new Map<string, ProjectActivityItem[]>();

    for (const item of items) {
      const key = format(item.occurredAt, "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), item]);
    }

    return Array.from(map.entries()).map(([key, itemsForDay]) => ({
      key,
      date: itemsForDay[0]?.occurredAt ?? new Date(key),
      items: itemsForDay,
    }));
  }, [activityQuery.data]);

  const projectOptions = (projectsQuery.data ?? []).map((project) => ({
    id: project.id,
    name: project.name || project.contents?.[0]?.name || "Unnamed Project",
  }));

  const hasActiveFilters = Boolean(
    search || projectId || actorName || type || startDate || endDate,
  );
  const hasError = activityQuery.isError || projectsQuery.isError;

  const exportRows = async () => {
    return fetchAllProjectActivity({
      ...filters,
      page: 1,
      limit: 100,
    });
  };

  const handleExportCsv = async () => {
    if (!canExport) return;
    setExporting("csv");
    try {
      const rows = await exportRows();
      exportRowsToCsv(
        `activity-history-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          { key: "occurredAt", label: "Occurred At" },
          { key: "actor", label: "Actor" },
          { key: "project", label: "Project" },
          { key: "type", label: "Type" },
          { key: "target", label: "Target" },
          { key: "summary", label: "Summary" },
          { key: "time", label: "Time" },
        ],
        rows.map((activity) => ({
          occurredAt: format(activity.occurredAt, "yyyy-MM-dd HH:mm"),
          actor: activity.actor.name ?? "System",
          project: activity.project.name,
          type: TYPE_OPTIONS.find((option) => option.value === activity.type)?.label ?? activity.type,
          target: activity.targetLabel,
          summary: `${activity.actor.name ?? "System"} ${getActivitySummary(activity)}`.trim(),
          time: format(activity.occurredAt, "p"),
        })),
      );
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    if (!canExport) return;
    setExporting("pdf");
    try {
      const rows = await exportRows();
      exportReportToPdfPrintWindow({
        filename: `activity-history-${new Date().toISOString().slice(0, 10)}.pdf`,
        title: "Activity History",
        subtitle:
          "Filtered project-management activity across the projects visible to the current user.",
        sections: rows.slice(0, 80).map((activity) => ({
          title: `${format(activity.occurredAt, "PPP p")} - ${activity.targetLabel}`,
          rows: [
            { label: "Actor", value: activity.actor.name ?? "System" },
            { label: "Project", value: activity.project.name },
            {
              label: "Type",
              value:
                TYPE_OPTIONS.find((option) => option.value === activity.type)?.label ??
                activity.type,
            },
            {
              label: "Summary",
              value: `${activity.actor.name ?? "System"} ${getActivitySummary(activity)}`.trim(),
            },
          ],
        })),
      });
    } finally {
      setExporting(null);
    }
  };

  if (!canView) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-chart-2/10 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderKanban className="h-4 w-4" />
              <span>Projects Management</span>
              <span>/</span>
              <span>Global View</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Real project-management activity across your accessible projects. Filter by date,
              project, event type, or team member and jump straight back into the related workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel
                    values={{ search, projectId, actorName, type, startDate, endDate }}
                    onChange={setParam as any}
                    onDateRangeChange={setDateRange}
                    projectOptions={projectOptions}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {hasActiveFilters ? (
              <Button variant="outline" onClick={() => router.replace(pathname)}>
                Reset filters
              </Button>
            ) : null}

            {canExport ? (
              <ExportMenuButton
                exporting={exporting}
                onExportCsv={() => void handleExportCsv()}
                onExportPdf={() => void handleExportPdf()}
                label="Export Log"
                menuClassName="w-48"
              />
            ) : (
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Export restricted
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="sticky top-20 hidden h-fit border-border/70 bg-card/95 shadow-sm lg:block">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Filters
            </CardTitle>
            <CardDescription>Refine the PM feed without leaving the workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <FilterPanel
              values={{ search, projectId, actorName, type, startDate, endDate }}
              onChange={setParam as any}
              onDateRangeChange={setDateRange}
              projectOptions={projectOptions}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard
              icon={Activity}
              label="Visible events"
              value={activityQuery.data?.pagination.records ?? 0}
              tone="primary"
              loading={activityQuery.isLoading}
            />
            <MetricCard
              icon={Users}
              label="Projects in scope"
              value={projectOptions.length}
              tone="info"
              loading={projectsQuery.isLoading}
            />
            <MetricCard
              icon={CalendarDays}
              label="Current page"
              value={activityQuery.data?.pagination.currentPage ?? 1}
              hint={
                activityQuery.data
                  ? `${Math.max(activityQuery.data.pagination.totalPages, 1)} total`
                  : undefined
              }
              tone="running"
              loading={activityQuery.isLoading}
            />
          </div>

          <div className="space-y-8">
            {activityQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : hasError ? (
              <Card className="border-destructive/20">
                <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="rounded-full bg-destructive/10 p-4 text-destructive">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold">Unable to load activity history</div>
                    <div className="text-sm text-muted-foreground">
                      Check your project permissions, token freshness, or backend activity endpoint and try again.
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => activityQuery.refetch()}>
                    Try again
                  </Button>
                </CardContent>
              </Card>
            ) : grouped.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <Activity className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold">No activity found</div>
                    <div className="text-sm text-muted-foreground">
                      Try broadening the date window or clearing one of the current filters.
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              grouped.map((group) => (
                <div key={group.key} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.18em]">
                      {getDayLabel(group.date)}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>

                  <div className="space-y-4">
                    {group.items.map((activity) => {
                      const meta = getActivityMeta(activity);
                      const Icon = meta.icon;

                      return (
                        <Link key={activity.id} href={buildActivityHref(activity)}>
                          <Card className="border-border/70 bg-card/95 shadow-sm transition-colors hover:border-primary/40">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="relative">
                                  <Avatar className="h-12 w-12 border">
                                    <AvatarImage
                                      src={resolveActivityActorImage(activity.actor.image)}
                                    />
                                    <AvatarFallback>{getInitials(activity.actor.name)}</AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={cn(
                                      "absolute -bottom-1 -right-1 rounded-full border p-1 shadow-sm",
                                      meta.bg,
                                      meta.border,
                                    )}
                                  >
                                    <Icon className={cn("h-3.5 w-3.5", meta.color)} />
                                  </div>
                                </div>

                                <div className="min-w-0 flex-1 space-y-2">
                                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-1">
                                      <div className="font-medium leading-6 text-foreground">
                                        <span className="font-semibold">{activity.actor.name ?? "System"}</span>{" "}
                                        {getActivitySummary(activity)}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <span>{activity.project.name}</span>
                                        <span>•</span>
                                        <span>{format(activity.occurredAt, "p")}</span>
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="w-fit">
                                      {TYPE_OPTIONS.find((option) => option.value === activity.type)?.label ?? activity.type}
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <Badge variant="outline" className="font-mono">
                                      {activity.targetLabel}
                                    </Badge>
                                    {activity.metadata?.nextStatus ? (
                                      <Badge variant="outline" className="gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {String(activity.metadata.nextStatus)}
                                      </Badge>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {activityQuery.data ? (
            <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <div className="text-sm text-muted-foreground">
                Page {activityQuery.data.pagination.currentPage} of{" "}
                {Math.max(activityQuery.data.pagination.totalPages, 1)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (activityQuery.data.pagination.totalPages || 1)}
                  onClick={() => changePage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

