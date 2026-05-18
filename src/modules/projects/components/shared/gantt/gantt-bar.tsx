"use client";

import { CalendarRange, GitBranch, ListTodo } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { GanttBar, GanttRow } from "@/modules/projects/types/gantt";

interface GanttBarProps {
  bar: GanttBar;
  row: GanttRow;
  isActive?: boolean;
  rowHeight: number;
  onClick: (row: GanttRow) => void;
}

export default function GanttBarElement({
  bar,
  row,
  isActive = false,
  rowHeight,
  onClick,
}: GanttBarProps) {
  const barPadding = (rowHeight - getBarHeight(row)) / 2;
  const inlineThreshold = row.type === "task" ? 136 : 120;
  const shouldRenderInlineLabel = bar.width >= inlineThreshold;
  const shouldRenderExternalLabel =
    (row.type === "epic" || row.type === "task") && !shouldRenderInlineLabel;
  const showInlineTypePill =
    !!row.itemTypeLabel &&
    bar.width >=
      (row.type === "task" ? 208 : row.type === "epic" ? 168 : 200);
  const externalLabelText =
    row.type === "task" && row.keyLabel
      ? `${row.keyLabel} - ${row.label}`
      : row.label;

  if (row.type === "milestone") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute cursor-pointer"
            style={{
              left: bar.left - 7,
              top: bar.top + rowHeight / 2 - 7,
            }}
            onClick={() => onClick(row)}
          >
            <div
              className={cn(
                "size-[14px] rotate-45 rounded-[2px] border-2 transition-transform hover:scale-110",
                row.statusCategory === "done"
                  ? "border-[var(--pm-task-done-dot)]/30"
                  : "border-primary/30",
              )}
              style={{
                backgroundColor:
                  row.statusCategory === "done"
                    ? "var(--pm-task-done-dot)"
                    : row.statusCategory === "in_progress"
                      ? "var(--pm-task-in-progress-dot)"
                      : "var(--pm-progress-fill-overdue)",
              }}
            />
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm",
                  isActive
                    ? "border-primary/50 bg-primary/10 ring-2 ring-primary/15"
                    : "border-border/60 bg-background/90",
                )}
              >
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                  Milestone
                </span>
                <span className="max-w-[220px] truncate">{row.label}</span>
              </span>
            </div>
          </div>
        </TooltipTrigger>

        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{row.label}</p>
          {row.startDate ? (
            <p className="text-[10px] text-muted-foreground">
              Due {row.startDate.toLocaleDateString()}
            </p>
          ) : null}
        </TooltipContent>
      </Tooltip>
    );
  }

  const height = getBarHeight(row);
  const isSprint = row.type === "sprint";
  const isEpic = row.type === "epic";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="group absolute cursor-pointer"
          style={{
            left: bar.left,
            top: bar.top + barPadding,
            width: Math.max(bar.width, 4),
            height,
          }}
          onClick={() => onClick(row)}
        >
          <div
            className={cn(
              "relative h-full w-full overflow-hidden border-y border-r shadow-sm transition-all duration-200 group-hover:brightness-95 group-hover:shadow-md",
              isSprint && "rounded-md border-border/50",
              isEpic && "rounded-md border-border/40",
              !isSprint && !isEpic && "rounded-sm border-border/30",
              isActive &&
                "ring-2 ring-primary/30 shadow-[0_0_0_1px_hsl(var(--primary)/0.18)]",
            )}
            style={getBarStyles(row)}
          >
            {row.progress > 0 ? (
              <div
                className="absolute bottom-0 left-0 h-[4px] transition-all duration-500"
                style={{
                  width: `${row.progress}%`,
                  backgroundColor: isSprint
                    ? "var(--pm-sprint-running-dot)"
                    : isEpic
                      ? row.color || "var(--pm-project-running-accent)"
                      : row.statusCategory === "done"
                        ? "var(--pm-task-done-dot)"
                        : row.statusCategory === "in_progress"
                          ? "var(--pm-task-in-progress-dot)"
                          : "var(--pm-task-todo-dot)",
                  opacity: 0.85,
                }}
              />
            ) : null}

            {shouldRenderInlineLabel ? (
              <div className="relative z-[1] flex h-full items-center gap-1 px-2">
                {row.keyLabel ? (
                  <span className="shrink-0 rounded-full bg-background/80 px-1.5 py-0.5 font-mono text-[9px] font-bold text-foreground/80 shadow-sm">
                    {row.keyLabel}
                  </span>
                ) : null}
                {showInlineTypePill ? (
                  <span className="shrink-0 rounded-full border border-border/60 bg-background/75 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {row.itemTypeLabel?.replace(/_/g, " ")}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "truncate text-[10px] font-semibold drop-shadow-sm",
                    isSprint && "text-primary",
                    isEpic && "text-foreground/90",
                    !isSprint && !isEpic && "text-foreground/90",
                  )}
                >
                  {row.label}
                </span>
              </div>
            ) : null}

            {bar.isDraggable && bar.width > 40 ? (
              <div className="absolute bottom-0 right-1.5 top-0 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="h-3 w-[3px] rounded-sm border-l border-r border-foreground/30 mix-blend-multiply" />
              </div>
            ) : null}
          </div>

          {shouldRenderExternalLabel ? (
            <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-[3] -translate-y-1/2">
              <span
                className={cn(
                  "inline-flex max-w-[320px] items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-md backdrop-blur-sm",
                  isActive
                    ? "border-primary/50 bg-primary/10 ring-2 ring-primary/15"
                    : "border-border/70 bg-background/96",
                )}
              >
                {row.type === "task" && row.keyLabel ? (
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
        </div>
      </TooltipTrigger>

      <TooltipContent side="top" className="max-w-[260px] text-xs">
        <p className="font-medium">{row.label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          {row.itemTypeLabel ? <span>{row.itemTypeLabel}</span> : null}
          {row.startDate && row.endDate ? (
            <span className="inline-flex items-center gap-1">
              <CalendarRange className="size-3" />
              {row.startDate.toLocaleDateString()} - {row.endDate.toLocaleDateString()}
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

function getBarHeight(row: GanttRow): number {
  switch (row.type) {
    case "sprint":
      return 28;
    case "epic":
      return 24;
    case "task":
      return 20;
    default:
      return 20;
  }
}

function getBarStyles(row: GanttRow): React.CSSProperties {
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

  const statusKey = (row.status === "BACKLOG"
    ? "backlog"
    : row.statusCategory
  ).replace(/_/g, "-");

  return {
    backgroundColor: `var(--pm-task-${statusKey}-bg, var(--pm-task-backlog-bg))`,
    borderLeft: `2px solid var(--pm-task-${statusKey}-dot, var(--pm-task-backlog-dot))`,
    opacity: 0.98,
  };
}
