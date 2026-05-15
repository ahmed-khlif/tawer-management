"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Diamond,
  GitBranch,
  Layers3,
  ListTree,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { GanttRow } from "@/modules/projects/types/gantt";
import { getTaskStatusBadgeClass } from "@/modules/projects/utils/gantt-helpers";

interface GanttRowLabelProps {
  row: GanttRow;
  isActive?: boolean;
  onToggleCollapse: (rowId: string) => void;
  onRowClick: (row: GanttRow) => void;
}

const ROW_HEIGHT = 44;

const DEPTH_INDENT: Record<number, string> = {
  0: "pl-3",
  1: "pl-8",
  2: "pl-14",
  3: "pl-20",
  4: "pl-24",
};

function TaskStatusIcon({ row }: { row: GanttRow }) {
  if (row.type === "milestone") {
    return <Diamond className="size-3 shrink-0 text-primary" />;
  }

  if (row.type === "epic") {
    return (
      <span
        className="size-2 shrink-0 rounded-full"
        style={{
          backgroundColor: row.color ?? "var(--pm-project-running-accent)",
        }}
      />
    );
  }

  if (row.type !== "task") return null;

  if (row.statusCategory === "done") {
    return (
      <CheckCircle2
        className="size-3 shrink-0"
        style={{ color: "var(--pm-task-done-dot)" }}
      />
    );
  }

  if (row.statusCategory === "in_progress") {
    return (
      <Circle
        className="size-3 shrink-0"
        style={{ color: "var(--pm-task-in-progress-dot)" }}
      />
    );
  }

  if (row.statusCategory === "review") {
    return (
      <Circle
        className="size-3 shrink-0"
        style={{ color: "var(--pm-task-in-review-dot)" }}
      />
    );
  }

  return (
    <Circle
      className="size-3 shrink-0"
      style={{ color: "var(--pm-task-todo-dot)" }}
    />
  );
}

export default function GanttRowLabel({
  row,
  isActive = false,
  onToggleCollapse,
  onRowClick,
}: GanttRowLabelProps) {
  const ChevronIcon = row.isCollapsed ? ChevronRight : ChevronDown;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onRowClick(row)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRowClick(row);
        }
      }}
      className={cn(
        "flex cursor-pointer items-center border-b border-border/40 transition-all hover:bg-muted/40",
        row.type === "sprint" && "bg-muted/20",
        isActive &&
          "bg-primary/8 shadow-[inset_3px_0_0_0_hsl(var(--primary))] ring-1 ring-primary/10",
        DEPTH_INDENT[row.depth] ?? "pl-3",
      )}
      style={{ height: ROW_HEIGHT }}
    >
      <div className="mr-2 flex min-w-0 flex-1 items-center gap-2">
        <div className="flex size-4 shrink-0 items-center justify-center">
          {row.isCollapsible && (
            <button
              type="button"
              className="flex size-4 items-center justify-center rounded-sm hover:bg-muted/60"
              onClick={(event) => {
                event.stopPropagation();
                onToggleCollapse(row.id);
              }}
            >
              <ChevronIcon className="size-3 text-muted-foreground" />
            </button>
          )}
        </div>

        <TaskStatusIcon row={row} />

        <div className="min-w-0 flex-1 pr-3">
          <TooltipProvider>
            <Tooltip delayDuration={250}>
              <TooltipTrigger asChild>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1.5">
                    {row.keyLabel ? (
                      <span className="shrink-0 rounded bg-muted px-1 py-0.5 font-mono text-[9px] font-bold tracking-wide text-muted-foreground">
                        {row.keyLabel}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "truncate text-[13px] leading-tight",
                        row.type === "sprint" && "font-semibold text-foreground",
                        row.type === "milestone" && "font-medium",
                      )}
                    >
                      {row.label}
                    </span>
                  </div>

                  <div className="mt-[2px] flex flex-wrap items-center gap-1.5">
                    {row.itemTypeLabel ? (
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                        {row.itemTypeLabel.replace(/_/g, " ")}
                      </span>
                    ) : null}

                    {typeof row.childTaskCount === "number" && row.childTaskCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <ListTree className="size-2.5" />
                        {row.childTaskCount}
                      </span>
                    ) : null}

                    {typeof row.dependencyCount === "number" && row.dependencyCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <GitBranch className="size-2.5" />
                        {row.dependencyCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </TooltipTrigger>

              <TooltipContent side="right" className="max-w-[280px]">
                <p className="text-xs font-medium">{row.label}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                  {row.keyLabel ? <span>{row.keyLabel}</span> : null}
                  {row.itemTypeLabel ? <span>{row.itemTypeLabel}</span> : null}
                  {row.startDate && row.endDate ? (
                    <span>
                      {row.startDate.toLocaleDateString()} - {row.endDate.toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {(row.type === "sprint" || row.type === "epic") && row.progress >= 0 ? (
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-[3px] w-16 overflow-hidden rounded-full bg-border/40">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${row.progress}%`,
                    backgroundColor:
                      row.type === "sprint"
                        ? "var(--pm-sprint-running-dot)"
                        : "var(--pm-project-running-accent)",
                  }}
                />
              </div>
              <span className="text-[9px] font-medium leading-none text-muted-foreground">
                {Math.round(row.progress)}%
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mr-4 flex shrink-0 items-center gap-1.5">
        {row.type === "task" && row.childIds.length > 0 ? (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            <Layers3 className="mr-1 size-2.5" />
            {row.childIds.length}
          </Badge>
        ) : null}

        {row.type !== "sprint" ? (
          <Badge
            variant="outline"
            className={cn(
              "px-1.5 py-0 text-[10px] uppercase",
              getTaskStatusBadgeClass(row.status),
            )}
          >
            {row.statusLabel}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
