"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { addDays } from "date-fns";
import {
  CalendarRange,
  GitBranch,
  ListTodo,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  GanttFeatureItem,
  GanttFeatureList,
  GanttHeader,
  GanttMarker,
  GanttProvider,
  GanttTimeline,
  GanttToday,
  getOffset,
  getWidth,
  type GanttFeature,
  type GanttStatus,
  useGanttContext,
} from "@/components/kibo-ui/gantt";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { GanttRow, GanttZoom } from "@/modules/projects/types/gantt";
import type { GanttBar } from "@/modules/projects/types/gantt";
import type { GanttChart } from "@/modules/projects/types/project-milestones";
import { projectQueryKeys } from "@/modules/projects/query-keys";
import { updateProjectEpic } from "@/modules/projects/services/api/project-epics";
import {
  updateProjectMilestone,
} from "@/modules/projects/services/api/project-milestones";
import uploadProjectTask from "@/modules/projects/services/api/project-task-upload";
import { uploadSprint } from "@/modules/projects/services/api/sprint-upload";
import {
  buildGanttRows,
  computeDependencyPath,
  computeViewportRange,
  getStatusDotVar,
} from "@/modules/projects/utils/gantt-helpers";

import GanttEmptyState from "./gantt-empty-state";
import LegacyGanttHeader from "./gantt-header";
import GanttLegend from "./gantt-legend";
import GanttRowLabel from "./gantt-row-label";
import GanttToolbar from "./gantt-toolbar";
import type { ResolvedAssignee } from "@/modules/projects/utils/resolve-assignee";

interface ProjectKiboGanttChartProps {
  data: GanttChart;
  isLoading?: boolean;
  projectId?: string;
  onRowActivate?: (row: GanttRow) => void;
  taskAssignees?: Record<string, ResolvedAssignee>;
  filterContent?: ReactNode;
  activeFilterCount?: number;
  hasActiveFilters?: boolean;
}

type FeatureOverrides = Record<
  string,
  {
    startAt: Date;
    endAt: Date | null;
  }
>;

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 56;
const BASE_LEFT_PANEL_WIDTH = 270;
const STATUS_COLUMN_WIDTH = 112;
const ASSIGNEE_COLUMN_WIDTH = 88;

function mapZoomToKibo(
  zoom: GanttZoom,
): { range: "daily" | "monthly" | "quarterly"; zoom: number } {
  switch (zoom) {
    case "day":
      return { range: "daily", zoom: 120 };
    case "week":
      return { range: "daily", zoom: 72 };
    case "month":
      return { range: "monthly", zoom: 100 };
  }
}

function getFeatureStatus(row: GanttRow): GanttStatus {
  return {
    id: row.status,
    name: row.statusLabel,
    color: getStatusDotVar(row.statusCategory),
  };
}

function getFeatureDates(row: GanttRow) {
  const startAt = row.startDate ?? new Date();
  const endAt =
    row.type === "milestone" ? addDays(startAt, 1) : row.endDate ?? addDays(startAt, 1);

  return { startAt, endAt };
}

function ProjectKiboFeatureCard({
  row,
  isActive,
  onOpen,
  width,
}: {
  row: GanttRow;
  isActive: boolean;
  onOpen: () => void;
  width: number;
}) {
  const isSprint = row.type === "sprint";
  const isEpic = row.type === "epic";
  const isTask = row.type === "task";
  const isMilestone = row.type === "milestone";
  const isSubtask = row.itemTypeLabel?.toLowerCase() === "subtask";
  const progressTone =
    isSprint
      ? "bg-primary"
      : isEpic
        ? "bg-[var(--pm-project-running-accent)]"
        : row.statusCategory === "done"
          ? "bg-[var(--pm-task-done-dot)]"
          : row.statusCategory === "in_progress"
            ? "bg-[var(--pm-task-in-progress-dot)]"
            : "bg-[var(--pm-task-todo-dot)]";
  const inlineThreshold = isTask ? 136 : isSprint ? 64 : 120;
  const shouldRenderInlineLabel = width >= inlineThreshold;
  const shouldRenderExternalLabel =
    (isTask || isEpic) && !shouldRenderInlineLabel && isActive;
  const shouldRenderSprintExternalLabel =
    isSprint && !shouldRenderInlineLabel && isActive;
  const showInlineTypePill =
    !!row.itemTypeLabel &&
    width >= (isTask ? 208 : isEpic ? 168 : 200);
  const shouldUseTaskChipLayout = isTask;
  const shouldRenderTaskGhostRail = shouldUseTaskChipLayout && width > 34;
  const externalLabelText =
    isTask && row.keyLabel ? `${row.keyLabel} - ${row.label}` : row.label;

  const meta = row.startDate && row.endDate
    ? `${row.startDate.toLocaleDateString()} - ${row.endDate.toLocaleDateString()}`
    : row.startDate
      ? row.startDate.toLocaleDateString()
      : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "relative flex h-full w-full items-center gap-2 overflow-visible text-left",
            isMilestone && "gap-2.5",
            shouldUseTaskChipLayout && "items-center",
          )}
        >
          {shouldRenderTaskGhostRail ? (
            <div className="absolute inset-y-[3px] left-0 right-0 rounded-md bg-foreground/[0.035]" />
          ) : null}

          {row.progress > 0 && !isMilestone ? (
            <div
              className={cn("absolute bottom-0 left-0 h-[3px] rounded-full", progressTone)}
              style={{ width: `${Math.round(row.progress)}%` }}
            />
          ) : null}

          {isMilestone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
              <span className="size-2 rotate-45 rounded-[2px] border border-primary/40 bg-primary/80" />
              <span className="truncate">{row.label}</span>
            </span>
          ) : null}

          {!isMilestone && !shouldUseTaskChipLayout && row.keyLabel ? (
            <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide text-primary">
              {row.keyLabel}
            </span>
          ) : null}

          {!isMilestone && !shouldUseTaskChipLayout && !shouldRenderInlineLabel && width >= 36 ? (
            <span
              className={cn(
                "shrink-0 rounded-full",
                isSubtask ? "h-3.5 w-9 bg-primary/18" : "h-3.5 w-7 bg-background/55",
              )}
            />
          ) : null}

          {!isMilestone && showInlineTypePill && row.itemTypeLabel ? (
            <span className="shrink-0 rounded-full border border-border/60 bg-background/75 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted-foreground">
              {row.itemTypeLabel.replace(/_/g, " ")}
            </span>
          ) : null}

          {shouldUseTaskChipLayout ? (
            <>
              <span
                className={cn(
                  "relative z-[2] inline-flex h-6 min-w-7 shrink-0 items-center justify-center rounded-md border text-[9px] font-bold shadow-sm",
                  isSubtask
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : row.statusCategory === "done"
                      ? "border-emerald-300/70 bg-emerald-100/90 text-emerald-700"
                      : row.statusCategory === "in_progress"
                        ? "border-sky-300/70 bg-sky-100/90 text-sky-700"
                        : "border-border/70 bg-background/95 text-muted-foreground",
                )}
                style={{ minWidth: Math.min(Math.max(width, 28), 42) }}
              >
                {row.keyLabel ?? ""}
              </span>

              {isActive ? (
                <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-[3] -translate-y-1/2">
                  <span className="inline-flex max-w-[320px] items-center gap-1.5 rounded-xl border border-primary/40 bg-background/98 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-md ring-2 ring-primary/15 backdrop-blur-sm">
                    {row.keyLabel ? (
                      <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide text-primary">
                        {row.keyLabel}
                      </span>
                    ) : null}
                    {row.itemTypeLabel ? (
                      <span className="shrink-0 rounded-full border border-border/60 bg-background/75 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {row.itemTypeLabel.replace(/_/g, " ")}
                      </span>
                    ) : null}
                    <span className="truncate">{row.label}</span>
                  </span>
                </div>
              ) : null}
            </>
          ) : !isMilestone && shouldRenderInlineLabel ? (
            <span
              className={cn(
                "truncate text-[11px] font-semibold",
                isActive ? "text-foreground" : "text-foreground/90",
              )}
            >
              {row.label}
            </span>
          ) : null}

          {!isMilestone && !shouldUseTaskChipLayout && typeof row.progress === "number" ? (
            <span className="ml-auto shrink-0 text-[10px] font-medium text-muted-foreground">
              {Math.round(row.progress)}%
            </span>
          ) : null}

          {!isMilestone ? (
            <div className="absolute bottom-0 right-1.5 top-0 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="h-3 w-[3px] rounded-sm border-l border-r border-foreground/25 mix-blend-multiply" />
            </div>
          ) : null}

          {shouldRenderSprintExternalLabel ? (
            <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-[3] -translate-y-1/2">
              <span
                className={cn(
                  "inline-flex max-w-[320px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold shadow-md backdrop-blur-sm",
                  isActive
                    ? "border-primary/45 bg-background/98 text-foreground ring-2 ring-primary/15"
                    : "border-primary/20 bg-background/96 text-primary",
                )}
              >
                {row.itemTypeLabel ? (
                  <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-primary">
                    {row.itemTypeLabel.replace(/_/g, " ")}
                  </span>
                ) : null}
                <span className="truncate">{row.label}</span>
              </span>
            </div>
          ) : null}

          {shouldRenderExternalLabel && !shouldUseTaskChipLayout ? (
            <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-[3] -translate-y-1/2">
              <span
                className={cn(
                  "inline-flex max-w-[320px] items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-md backdrop-blur-sm",
                  isActive
                    ? "border-primary/50 bg-primary/10 ring-2 ring-primary/15"
                    : "border-border/70 bg-background/96",
                )}
              >
                {isTask && row.keyLabel ? (
                  <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide text-primary">
                    {row.keyLabel}
                  </span>
                ) : null}
                {row.itemTypeLabel ? (
                  <span className="shrink-0 rounded-full border border-border/60 bg-background/75 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {row.itemTypeLabel.replace(/_/g, " ")}
                  </span>
                ) : null}
                <span className="truncate">{externalLabelText}</span>
              </span>
            </div>
          ) : null}
        </button>
      </TooltipTrigger>

      <TooltipContent side="top" className="max-w-[260px] text-xs">
        <p className="font-medium">{row.label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          {row.itemTypeLabel ? <span>{row.itemTypeLabel}</span> : null}
          {meta ? (
            <span className="inline-flex items-center gap-1">
              <CalendarRange className="size-3" />
              {meta}
            </span>
          ) : null}
        </div>
        {row.dependencyCount || row.childTaskCount ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            {row.dependencyCount ? (
              <span className="inline-flex items-center gap-1">
                <GitBranch className="size-3" />
                {row.dependencyCount} dependencies
              </span>
            ) : null}
            {row.childTaskCount ? (
              <span className="inline-flex items-center gap-1">
                <ListTodo className="size-3" />
                {row.childTaskCount} child items
              </span>
            ) : null}
          </div>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

function getTimelineWidth(context: ReturnType<typeof useGanttContext>) {
  const columnWidth = (context.columnWidth * context.zoom) / 100;

  if (context.range === "daily") {
    const totalDays = context.timelineData
      .flatMap((year) => year.quarters)
      .flatMap((quarter) => quarter.months)
      .reduce((sum, month) => sum + month.days, 0);

    return totalDays * columnWidth;
  }

  const totalMonths = context.timelineData.length * 12;
  return totalMonths * columnWidth;
}

function getFeatureCardClass(row: GanttRow, isActive: boolean) {
  if (row.type === "sprint") {
    return cn(
      "rounded-md border-y border-r border-border/50 bg-primary/10 text-primary shadow-sm",
      isActive && "ring-2 ring-primary/20",
    );
  }

  if (row.type === "epic") {
    return cn(
      "rounded-md border-y border-r border-border/40 bg-background shadow-sm",
      isActive && "ring-2 ring-primary/20",
    );
  }

  if (row.type === "milestone") {
    return cn(
      "rounded-full border-primary/30 bg-primary/10 text-primary shadow-sm",
      isActive && "ring-2 ring-primary/20",
    );
  }

  return cn(
    "rounded-sm border-y border-r border-border/30 bg-background/95 shadow-sm",
    row.type === "task" && "overflow-visible border-transparent bg-transparent shadow-none",
    isActive && "ring-2 ring-primary/20",
  );
}

function getFeatureCardStyle(row: GanttRow): CSSProperties {
  if (row.type === "sprint") {
    return {
      backgroundColor: "var(--pm-sprint-running-bg, hsl(var(--primary) / 0.16))",
      borderLeft: "3px solid var(--pm-sprint-running-dot, hsl(var(--primary)))",
    };
  }

  if (row.type === "epic" && row.color) {
    return {
      backgroundColor: `${row.color}2a`,
      borderLeft: `3px solid ${row.color}`,
    };
  }

  if (row.type === "epic") {
    return {
      backgroundColor: "var(--pm-project-running-bg)",
      borderLeft: "3px solid var(--pm-project-running-accent)",
    };
  }

  if (row.type === "milestone") {
    return {
      backgroundColor: "hsl(var(--primary) / 0.10)",
      borderLeft: "2px solid hsl(var(--primary) / 0.55)",
    };
  }

  const taskVisualKey =
    row.itemTypeLabel?.toLowerCase() === "subtask"
      ? "review"
      : row.status === "BACKLOG"
        ? "backlog"
        : row.statusCategory;
  const normalizedKey = taskVisualKey.replace(/_/g, "-");

  return {
    backgroundColor: "transparent",
    borderLeft: `2px solid var(--pm-task-${normalizedKey}-dot, var(--pm-task-backlog-dot))`,
    boxShadow: "none",
    opacity: 1,
  };
}

function ProjectKiboDependencyOverlay({
  rows,
  features,
}: {
  rows: GanttRow[];
  features: Map<string, GanttFeature>;
}) {
  const context = useGanttContext();

  const { paths, totalWidth, totalHeight } = useMemo(() => {
    if (context.timelineData.length === 0) {
      return { paths: [] as { key: string; d: string }[], totalWidth: 0, totalHeight: 0 };
    }

    const timelineStartDate = new Date(context.timelineData[0].year, 0, 1);
    const barMap = new Map<string, GanttBar>();

    rows.forEach((row, index) => {
      const feature = features.get(row.id);
      if (!feature) return;

      const left = getOffset(feature.startAt, timelineStartDate, context);
      const width = getWidth(feature.startAt, feature.endAt, context);

        barMap.set(row.id, {
          rowId: row.id,
          left,
          width,
          top: index * ROW_HEIGHT,
          color: feature.status.color,
          label: feature.name,
          isDraggable: true,
          isResizable: row.type !== "milestone",
        });
    });

    const dependencyPaths: { key: string; d: string }[] = [];

    rows.forEach((row) => {
      row.dependencies.forEach((dependency) => {
        const fromBar = barMap.get(dependency.fromRowId);
        const toBar = barMap.get(dependency.toRowId);
        if (!fromBar || !toBar) return;

        dependencyPaths.push({
          key: `${dependency.fromRowId}-${dependency.toRowId}`,
          d: computeDependencyPath(fromBar, toBar),
        });
      });
    });

    return {
      paths: dependencyPaths,
      totalWidth: getTimelineWidth(context),
      totalHeight: rows.length * ROW_HEIGHT,
    };
  }, [context, features, rows]);

  if (paths.length === 0) {
    return null;
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[6]"
      width={totalWidth}
      height={totalHeight}
      overflow="visible"
    >
      <defs>
        <marker
          id="project-kibo-gantt-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M 0 0 L 6 3 L 0 6 Z"
            fill="hsl(var(--muted-foreground))"
            opacity="0.45"
          />
        </marker>
      </defs>
      {paths.map((path) => (
        <g key={path.key}>
          <path
            d={path.d}
            fill="none"
            stroke="hsl(var(--background))"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d={path.d}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
            opacity="0.55"
            markerEnd="url(#project-kibo-gantt-arrow)"
          />
        </g>
      ))}
    </svg>
  );
}

function ProjectKiboHeader({ zoom }: { zoom: GanttZoom }) {
  const context = useGanttContext();

  const viewport = useMemo(() => {
    if (context.timelineData.length === 0) {
      const today = new Date();
      return {
        zoom,
        startDate: today,
        endDate: addDays(today, 14),
        pixelsPerDay: 32,
        totalDays: 14,
        totalWidth: 14 * 32,
      };
    }

    const timelineStartDate = new Date(context.timelineData[0].year, 0, 1);

    if (context.range === "daily") {
      const totalDays = context.timelineData
        .flatMap((year) => year.quarters)
        .flatMap((quarter) => quarter.months)
        .reduce((sum, month) => sum + month.days, 0);
      const pixelsPerDay = (context.columnWidth * context.zoom) / 100;
      return {
        zoom,
        startDate: timelineStartDate,
        endDate: addDays(timelineStartDate, totalDays - 1),
        pixelsPerDay,
        totalDays,
        totalWidth: totalDays * pixelsPerDay,
      };
    }

    return null;
  }, [context, zoom]);

  if (!viewport) {
    return <div className="h-full"><div className="h-full"><div className="h-full" /></div></div>;
  }

  return <LegacyGanttHeader viewport={viewport} />;
}

function ProjectKiboGanttBody({
  rows,
  zoom,
  todayFocusVersion,
  setCollapsedIds,
  projectId,
  onRowActivate,
  taskAssignees,
  showStatusColumn,
  showAssigneeColumn,
  leftPanelWidth,
}: {
  rows: GanttRow[];
  zoom: GanttZoom;
  todayFocusVersion: number;
  setCollapsedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  projectId?: string;
  onRowActivate?: (row: GanttRow) => void;
  taskAssignees?: Record<string, ResolvedAssignee>;
  showStatusColumn: boolean;
  showAssigneeColumn: boolean;
  leftPanelWidth: number;
}) {
  const ganttContext = useGanttContext();
  const { scrollToDate, scrollToFeature, ref: scrollRef } = ganttContext;
  const queryClient = useQueryClient();
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [featureOverrides, setFeatureOverrides] = useState<FeatureOverrides>({});

  useEffect(() => {
    if (todayFocusVersion <= 0) return;

    const timer = window.setTimeout(() => {
      scrollToDate?.(new Date());
    }, 120);

    return () => window.clearTimeout(timer);
  }, [todayFocusVersion, scrollToDate]);

  const features = useMemo(() => {
    const map = new Map<string, GanttFeature>();

    for (const row of rows) {
      const override = featureOverrides[row.id];
      const fallbackDates = getFeatureDates(row);
      map.set(row.id, {
        id: row.id,
        name: row.label,
        startAt: override?.startAt ?? fallbackDates.startAt,
        endAt: override?.endAt ?? fallbackDates.endAt,
        status: getFeatureStatus(row),
      });
    }

    return map;
  }, [featureOverrides, rows]);

  const markers = useMemo(
    () =>
      rows
        .filter((row) => row.type === "milestone" && row.startDate)
        .map((row) => ({
          id: row.id,
          date: row.startDate as Date,
          label: row.label,
          className:
            row.statusCategory === "done"
              ? "bg-emerald-100 text-emerald-900"
              : "bg-primary/10 text-primary",
        })),
    [rows],
  );

  const barMetrics = useMemo(() => {
    if (features.size === 0 || ganttContext.timelineData.length === 0) {
      return new Map<string, { left: number; width: number }>();
    }

    const timelineStartDate = new Date(ganttContext.timelineData[0].year, 0, 1);
    const map = new Map<string, { left: number; width: number }>();

    rows.forEach((row) => {
      const feature = features.get(row.id);
      if (!feature) return;

      map.set(row.id, {
        left: getOffset(feature.startAt, timelineStartDate, ganttContext),
        width: getWidth(feature.startAt, feature.endAt, ganttContext),
      });
    });

    return map;
  }, [features, ganttContext, rows]);

  const handleOpenRow = useCallback(
    (row: GanttRow) => {
      setActiveRowId(row.id);
      const feature = features.get(row.id);
      const rowIndex = rows.findIndex((item) => item.id === row.id);
      const scrollElement = scrollRef?.current;

      if (feature) {
        scrollToFeature?.(feature);
      }

      if (scrollElement && rowIndex >= 0) {
        const topTarget = Math.max(
          0,
          HEADER_HEIGHT + rowIndex * ROW_HEIGHT - scrollElement.clientHeight * 0.35,
        );
        scrollElement.scrollTo({
          top: topTarget,
          behavior: "smooth",
        });
      }
      onRowActivate?.(row);
    },
    [features, onRowActivate, rows, scrollRef, scrollToFeature],
  );

  const handleMoveFeature = useCallback(
    async (id: string, startAt: Date, endAt: Date | null) => {
      const row = rows.find((item) => item.id === id);
      if (!row || !projectId) {
        return;
      }

      const previous = featureOverrides[id];
      setFeatureOverrides((prev) => ({
        ...prev,
        [id]: {
          startAt,
          endAt,
        },
      }));

      const normalizedEndAt =
        endAt ??
        (row.type === "milestone" ? addDays(startAt, 1) : row.endDate ?? addDays(startAt, 1));

      try {
        if (row.type === "sprint") {
          await uploadSprint(
            projectId,
            {
              startDate: startAt.toISOString(),
              endDate: normalizedEndAt.toISOString(),
              estimatedStartDate: startAt.toISOString(),
              estimatedEndDate: normalizedEndAt.toISOString(),
            },
            row.originalId,
          );
        } else if (row.type === "epic") {
          await updateProjectEpic(projectId, row.originalId, {
            startDate: startAt.toISOString(),
            endDate: normalizedEndAt.toISOString(),
          });
        } else if (row.type === "milestone") {
          await updateProjectMilestone(projectId, row.originalId, {
            dueDate: startAt.toISOString(),
          });
        } else if (row.type === "task") {
          await uploadProjectTask({
            projectId,
            id: row.originalId,
            task: {
              dueDate: normalizedEndAt.toISOString(),
            },
          });
        }

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: projectQueryKeys.milestones.gantt(projectId),
          }),
          queryClient.invalidateQueries({
            queryKey: ["project-sprints", projectId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["project-epics", projectId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["project-milestones", projectId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["project-tasks", projectId],
          }),
          queryClient.invalidateQueries({
            queryKey: projectQueryKeys.tasks.kanban(projectId),
          }),
        ]);
      } catch (error: any) {
        setFeatureOverrides((prev) => {
          const next = { ...prev };
          if (previous) {
            next[id] = previous;
          } else {
            delete next[id];
          }
          return next;
        });

        const message =
          error?.response?.data?.message ||
          `Failed to update ${row.type} timeline dates.`;
        toast.error(message);
      }
    },
    [featureOverrides, projectId, queryClient, rows],
  );

  return (
    <>
      <div
        className="sticky left-0 z-30 shrink-0 border-r border-border/70 bg-card/95 shadow-[6px_0_18px_hsl(var(--foreground)/0.03)]"
        data-roadmap-ui="gantt-sidebar"
        style={{ width: leftPanelWidth }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div
            className="flex items-end border-b border-border/70 bg-muted/35 px-4 pb-2 shrink-0"
            style={{ height: HEADER_HEIGHT }}
          >
            <div className="flex-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Task Name
            </div>
            {showStatusColumn ? (
              <div className="w-[112px] text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Status
              </div>
            ) : null}
            {showAssigneeColumn ? (
              <div className="w-[88px] text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Assigned
              </div>
            ) : null}
          </div>

          <div className="bg-card/95">
            {rows.map((row) => (
              <GanttRowLabel
                key={row.id}
                row={row}
                isActive={activeRowId === row.id}
                onToggleCollapse={(id) => {
                  setCollapsedIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }}
                onRowClick={handleOpenRow}
                assignee={row.type === "task" ? taskAssignees?.[row.originalId] ?? null : null}
                showStatus={showStatusColumn}
                showAssignee={showAssigneeColumn}
              />
            ))}
          </div>
        </div>
      </div>

      <GanttTimeline className="bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.08)_100%)]">
        <div
          className="shrink-0 overflow-hidden border-b border-border/70 bg-background shadow-sm"
          style={{ height: HEADER_HEIGHT }}
        >
          {zoom === "month" ? (
            <GanttHeader />
          ) : (
            <ProjectKiboHeader zoom={zoom} />
          )}
        </div>

        <div
          className="absolute left-0 right-0 top-[var(--gantt-header-height)]"
          style={{ height: rows.length * ROW_HEIGHT }}
        >
          {rows.map((row, index) => (
            <div
              key={`${row.id}-bg`}
              className="absolute left-0 right-0 border-b border-border/20 transition-colors"
              style={{
                top: index * ROW_HEIGHT,
                height: ROW_HEIGHT,
                backgroundColor:
                  activeRowId === row.id
                    ? "hsl(var(--primary) / 0.08)"
                    : index % 2 === 1
                      ? "hsl(var(--muted) / 0.55)"
                      : "transparent",
                opacity: activeRowId === row.id ? 1 : index % 2 === 1 ? 0.15 : 1,
              }}
            />
          ))}
        </div>

        <GanttFeatureList className="space-y-0">
          <div className="relative h-full w-max">
            {rows.map((row) => {
              const feature = features.get(row.id);
              if (!feature) {
                return <div key={row.id} style={{ height: ROW_HEIGHT }} />;
              }

              return (
                <div key={row.id} style={{ height: ROW_HEIGHT }}>
                <GanttFeatureItem
                  {...feature}
                  onMove={handleMoveFeature}
                  cardClassName={getFeatureCardClass(
                    row,
                    activeRowId === row.id,
                  )}
                  cardStyle={getFeatureCardStyle(row)}
                  className={cn(
                    row.type === "milestone" && "[&_.rounded-md]:rounded-full",
                  )}
                >
                    <ProjectKiboFeatureCard
                      row={row}
                      isActive={activeRowId === row.id}
                      onOpen={() => handleOpenRow(row)}
                      width={barMetrics.get(row.id)?.width ?? 0}
                    />
                  </GanttFeatureItem>
                </div>
              );
            })}

            <ProjectKiboDependencyOverlay features={features} rows={rows} />
          </div>
        </GanttFeatureList>

        {markers.map((marker) => (
          <GanttMarker
            key={marker.id}
            {...marker}
            onClick={(markerId) => {
              const row = rows.find((item) => item.id === markerId);
              if (row) {
                handleOpenRow(row);
              }
            }}
          />
        ))}
        <GanttToday className="bg-primary/80 text-primary-foreground" />
      </GanttTimeline>
    </>
  );
}

export default function ProjectKiboGanttChart({
  data,
  isLoading,
  projectId: _projectId,
  onRowActivate,
  taskAssignees,
  filterContent,
  activeFilterCount = 0,
  hasActiveFilters = false,
}: ProjectKiboGanttChartProps) {
  const [zoom, setZoom] = useState<GanttZoom>("week");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStatusColumn, setShowStatusColumn] = useState(true);
  const [showAssigneeColumn, setShowAssigneeColumn] = useState(true);

  const rows = useMemo(() => buildGanttRows(data, collapsedIds), [collapsedIds, data]);
  const kiboScale = useMemo(() => mapZoomToKibo(zoom), [zoom]);
  const viewportRange = useMemo(() => computeViewportRange(data), [data]);
  const initialDate = viewportRange.start;
  const focusTodayOnMount = useMemo(() => {
    const today = new Date();
    return today >= viewportRange.start && today <= viewportRange.end;
  }, [viewportRange.end, viewportRange.start]);
  const [todayFocusVersion, setTodayFocusVersion] = useState(
    focusTodayOnMount ? 1 : 0,
  );
  const summary = useMemo(
    () => ({
      sprints: data.sprints.length,
      epics: data.epics.length,
      milestones: data.milestones.length,
      tasks: data.tasks.length,
    }),
    [data],
  );
  const leftPanelWidth = useMemo(
    () =>
      BASE_LEFT_PANEL_WIDTH +
      (showStatusColumn ? STATUS_COLUMN_WIDTH : 0) +
      (showAssigneeColumn ? ASSIGNEE_COLUMN_WIDTH : 0),
    [showAssigneeColumn, showStatusColumn],
  );

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    const container = fullscreenRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle Kibo Gantt fullscreen", error);
    }
  }, []);

  if (isLoading) {
    return <Skeleton className="h-[460px] w-full rounded-2xl" />;
  }

  if (rows.length === 0) {
    return hasActiveFilters ? (
      <GanttEmptyState
        message="No roadmap items match these filters"
        description="Try clearing some filters or widening the selected date range."
      />
    ) : (
      <GanttEmptyState />
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={fullscreenRef}
        className="flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm"
      >
        <GanttToolbar
          zoom={zoom}
          onZoomChange={setZoom}
          onScrollToToday={() => {
            const today = new Date();
            if (today >= viewportRange.start && today <= viewportRange.end) {
              setTodayFocusVersion((current) => current + 1);
            }
          }}
          summary={summary}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          filterContent={filterContent}
          activeFilterCount={activeFilterCount}
          showStatusColumn={showStatusColumn}
          showAssigneeColumn={showAssigneeColumn}
          onToggleStatusColumn={() => setShowStatusColumn((current) => !current)}
          onToggleAssigneeColumn={() => setShowAssigneeColumn((current) => !current)}
        />

        <div className="flex flex-1 overflow-hidden bg-background" style={{ minHeight: 460 }}>
          <GanttProvider
            range={kiboScale.range}
            zoom={kiboScale.zoom}
            rowHeight={ROW_HEIGHT}
            headerHeight={HEADER_HEIGHT}
            initialDate={initialDate}
            className="h-full w-full bg-card"
          >
            <ProjectKiboGanttBody
              rows={rows}
              zoom={zoom}
              todayFocusVersion={todayFocusVersion}
              setCollapsedIds={setCollapsedIds}
              projectId={_projectId}
              onRowActivate={onRowActivate}
              taskAssignees={taskAssignees}
              showStatusColumn={showStatusColumn}
              showAssigneeColumn={showAssigneeColumn}
              leftPanelWidth={leftPanelWidth}
            />
          </GanttProvider>
        </div>

        <GanttLegend />
        <div className="flex items-center justify-end gap-2 border-t border-border/50 bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
          <span>Shift + Scroll to pan horizontally</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

