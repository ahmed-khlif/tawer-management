"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BellRing,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Flag,
  FolderKanban,
  Layers3,
  ListChecks,
  TimerReset,
  Video,
} from "lucide-react";
import { differenceInCalendarDays, isAfter, isBefore, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EventCalendar } from "@/modules/events/components/calendar";
import { ProjectType } from "@/modules/projects/types/projects";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import { EmptyState } from "../../shared/empty-state";
import useProjectCalendar from "@/modules/projects/hooks/calendar/use-project-calendar";
import { ProjectCalendarItem, ProjectCalendarSource } from "@/modules/projects/types/project-calendar";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";

const SOURCE_OPTIONS: Array<{
  value: ProjectCalendarSource;
  label: string;
  icon: typeof FolderKanban;
}> = [
  { value: "PROJECT", label: "Project", icon: FolderKanban },
  { value: "SPRINT", label: "Sprints", icon: TimerReset },
  { value: "EPIC", label: "Epics", icon: Layers3 },
  { value: "MILESTONE", label: "Milestones", icon: Flag },
  { value: "TASK", label: "Tasks", icon: ListChecks },
  { value: "REMINDER", label: "Reminders", icon: BellRing },
  { value: "EVENT", label: "Meetings", icon: Video },
];

const defaultSources = SOURCE_OPTIONS.map((item) => item.value);

interface ProjectCalendarTabProps {
  project: ProjectType;
  permissions: ProjectPermissions;
}

function getRangeSummary(items: ProjectCalendarItem[]) {
  const today = startOfDay(new Date());
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 7);

  const upcoming = items.filter((item) => {
    const start = startOfDay(new Date(item.startDate));
    return (isAfter(start, today) || start.getTime() === today.getTime()) && isBefore(start, soon);
  }).length;

  const completed = items.filter((item) => item.status?.toLowerCase() === "completed" || item.status?.toLowerCase() === "done").length;
  const overdue = items.filter((item) => {
    const end = startOfDay(new Date(item.endDate));
    const status = item.status?.toLowerCase();
    return end.getTime() < today.getTime() && status !== "completed" && status !== "done";
  }).length;

  return { upcoming, completed, overdue };
}

export default function ProjectCalendarTab({
  project,
  permissions,
}: ProjectCalendarTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dashboardRoot = pathname.includes("/projects/")
    ? pathname.split("/projects/")[0]
    : "/dashboard";
  const visibleSourceOptions = useMemo(
    () =>
      SOURCE_OPTIONS.filter((option) => {
        switch (option.value) {
          case "SPRINT":
            return permissions.canViewSprint;
          case "EPIC":
            return permissions.canViewEpic;
          case "MILESTONE":
            return permissions.canViewMilestone;
          case "TASK":
            return permissions.canViewTask;
          case "REMINDER":
            return permissions.canView;
          case "EVENT":
            return permissions.canView;
          case "PROJECT":
          default:
            return permissions.canViewCalendar;
        }
      }),
    [permissions],
  );
  const [sources, setSources] = useState<ProjectCalendarSource[]>(
    visibleSourceOptions.length > 0
      ? visibleSourceOptions.map((item) => item.value)
      : defaultSources,
  );
  const [displayedRange, setDisplayedRange] = useState<{ from: Date; to: Date } | null>(null);

  const allowedSourceSet = useMemo(
    () => new Set(visibleSourceOptions.map((option) => option.value)),
    [visibleSourceOptions],
  );

  useEffect(() => {
    setSources((current) => {
      const next = current.filter((source) => allowedSourceSet.has(source));
      if (next.length > 0) {
        return next;
      }

      return visibleSourceOptions.map((option) => option.value);
    });
  }, [allowedSourceSet, visibleSourceOptions]);

  const calendarQuery = useProjectCalendar(project.id, {
    from: displayedRange?.from ?? null,
    to: displayedRange?.to ?? null,
    sources,
  });

  const items = calendarQuery.data?.items ?? [];
  const summary = useMemo(() => getRangeSummary(items), [items]);
  const totalDays =
    displayedRange ? differenceInCalendarDays(displayedRange.to, displayedRange.from) + 1 : null;

  const toggleSource = (value: ProjectCalendarSource) => {
    setSources((current) => {
      if (current.includes(value)) {
        const next = current.filter((entry) => entry !== value);
        return next.length > 0 ? next : current;
      }

      return [...current, value];
    });
  };

  const openCalendarItem = (item: ProjectCalendarItem) => {
    const params = new URLSearchParams();

    switch (item.sourceType) {
      case "TASK":
        params.set("tab", "tasks");
        params.set("sub", "kanban");
        params.set("taskId", item.sourceId);
        break;
      case "MILESTONE":
        params.set("tab", "planning");
        params.set("sub", "milestones");
        params.set("milestoneId", item.sourceId);
        break;
      case "SPRINT":
        params.set("tab", "planning");
        params.set("sub", "sprints");
        params.set("sprintId", item.sourceId);
        break;
      case "EPIC":
        params.set("tab", "planning");
        params.set("sub", "epics");
        params.set("epicId", item.sourceId);
        break;
      case "REMINDER":
        params.set("tab", "insights");
        params.set("sub", "reminders");
        break;
      case "EVENT":
        router.push(
          `${dashboardRoot}/calendar/meetings?eventId=${item.sourceId}&date=${encodeURIComponent(item.startDate.toISOString())}`,
        );
        return;
      default:
        params.set("tab", "overview");
        break;
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <PageHeaderStrip
        icon={CalendarRange}
        title="Project Calendar"
        description="See project ranges, planning windows, deadlines, and reminders in one delivery timeline."
        metrics={[
          { icon: Activity, value: items.length, label: "visible items" },
          { icon: Clock3, value: summary.upcoming, label: "next 7 days", tone: "info" },
          summary.overdue > 0
            ? { icon: Flag, value: summary.overdue, label: "overdue", tone: "destructive" }
            : { icon: CheckCircle2, value: summary.completed, label: "completed", tone: "success" },
        ]}
      />

      <Card className="rounded-2xl border-border/70 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {visibleSourceOptions.map((option) => {
                const Icon = option.icon;
                const active = sources.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="gap-1.5 rounded-full"
                    onClick={() => toggleSource(option.value)}
                  >
                    <Icon className="size-3.5" />
                    {option.label}
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {totalDays ? (
                <Badge variant="outline" className="rounded-full font-normal">
                  {totalDays} days in view
                </Badge>
              ) : null}
              <Badge variant="outline" className="rounded-full font-normal">
                {project.projectType === "AGILE" ? "Agile project" : "Freestyle project"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              {calendarQuery.isSuccess && items.length === 0 ? (
                <EmptyState
                  icon={CalendarRange}
                  message="Nothing in this window yet"
                  description="Try another calendar range or turn more project sources on to see delivery activity."
                  className="min-h-[32rem]"
                />
              ) : (
                <EventCalendar
                  events={items}
                  isLoading={calendarQuery.isLoading}
                  readOnly
                  hideCreateButton
                  onEventSelect={(event) => openCalendarItem(event as ProjectCalendarItem)}
                  setDisplayedDateRanges={setDisplayedRange}
                />
              )}
            </div>

            <div className="space-y-3">
              <Card className="rounded-2xl border-border/70 bg-card/90 shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Timeline Pulse
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">What this view tells you</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-sm font-medium">Upcoming work</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {summary.upcoming > 0
                          ? `${summary.upcoming} items land in the next 7 days.`
                          : "No near-term deadlines are currently visible."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-sm font-medium">Delivery risk</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {summary.overdue > 0
                          ? `${summary.overdue} items are already behind the calendar window.`
                          : "No overdue items are currently in this timeline slice."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-sm font-medium">Planning context</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {sources.includes("EVENT")
                          ? "Project meetings are included alongside delivery dates in this view."
                          : "Turn meetings on when you want delivery and coordination in one timeline."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/70 bg-card/90 shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Source Legend
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {visibleSourceOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant="outline"
                        className={cn(
                          "rounded-full font-normal",
                          sources.includes(option.value) ? "border-primary/30 bg-primary/5 text-primary" : "text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
