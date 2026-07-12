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
import type { ResolvedAssignee } from "@/modules/projects/utils/resolve-assignee";
import { AssigneeHoverPill } from "../assignee-hover-pill";

interface GanttRowLabelProps {
  row: GanttRow;
  isActive?: boolean;
  onToggleCollapse: (rowId: string) => void;
  onRowClick: (row: GanttRow) => void;
  assignee?: ResolvedAssignee | null;
  showStatus?: boolean;
  showAssignee?: boolean;
}

const ROW_HEIGHT = 44;
const TREE_START = 14;
const TREE_STEP = 24;
const TOGGLE_SIZE = 18;

function getContentPadding(depth: number) {
  return TREE_START + depth * TREE_STEP;
}

function getDepthGuideOffsets(depth: number) {
  return Array.from({ length: depth }, (_, index) => TREE_START + index * TREE_STEP + 8);
}

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
  assignee = null,
  showStatus = true,
  showAssignee = true,
}: GanttRowLabelProps) {
  const ChevronIcon = row.isCollapsed ? ChevronRight : ChevronDown;
  const contentPadding = getContentPadding(row.depth);
  const depthGuideOffsets = getDepthGuideOffsets(row.depth);
  const branchGuideLeft =
    row.depth > 0 ? TREE_START + (row.depth - 1) * TREE_STEP + 8 : null;

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
        "relative flex cursor-pointer items-center border-b border-border/40 transition-all hover:bg-muted/40",
        row.type === "sprint" && "bg-muted/25",
        isActive &&
          "bg-primary/8 shadow-[inset_3px_0_0_0_hsl(var(--primary))] ring-1 ring-primary/10",
      )}
      style={{ height: ROW_HEIGHT }}
    >
      {depthGuideOffsets.length > 0 ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32">
          {depthGuideOffsets.map((offset) => (
            <span
              key={`${row.id}-guide-${offset}`}
              className="absolute inset-y-0 w-px bg-border/55"
              style={{ left: offset }}
            />
          ))}
          {branchGuideLeft !== null ? (
            <>
              <span
                className="absolute w-px bg-border/70"
                style={{
                  left: branchGuideLeft,
                  top: 0,
                  height: "50%",
                }}
              />
              <span
                className="absolute h-px bg-border/70"
                style={{
                  left: branchGuideLeft,
                  top: "50%",
                  width: 16,
                }}
              />
            </>
          ) : null}
        </div>
      ) : null}

      <div className="mr-4 flex min-w-0 flex-1 items-center justify-between gap-3">
        <div
          className="flex min-w-0 flex-1 items-center gap-2"
          style={{ paddingLeft: contentPadding }}
        >
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md transition-colors",
              row.depth > 0 && "bg-muted/35",
              isActive && row.depth > 0 && "bg-primary/10",
            )}
            style={{ width: TOGGLE_SIZE, height: TOGGLE_SIZE }}
          >
            {row.isCollapsible && (
              <button
                type="button"
                className="flex size-4 items-center justify-center rounded-sm text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
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

          <div className="min-w-0 flex-1 pr-2">
            <TooltipProvider>
              <Tooltip delayDuration={250}>
                <TooltipTrigger asChild>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-1.5">
                      {row.keyLabel ? (
                        <span className="shrink-0 rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wide text-primary">
                          {row.keyLabel}
                        </span>
                      ) : null}
                      {row.itemTypeLabel ? (
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                            row.type === "sprint" && "border-primary/20 bg-primary/10 text-primary",
                            row.type === "epic" && "border-[var(--pm-project-running-accent)]/20 bg-[color:var(--pm-project-running-accent)]/10 text-[color:var(--pm-project-running-accent)]",
                            row.type !== "sprint" &&
                              row.type !== "epic" &&
                              "border-border/70 bg-background/85 text-foreground/70",
                          )}
                        >
                          {row.itemTypeLabel.replace(/_/g, " ")}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "truncate text-[13px] leading-tight font-medium",
                          row.type === "sprint" && "font-semibold text-foreground",
                          row.type === "epic" && "font-semibold text-foreground/90",
                          row.type === "milestone" && "font-medium text-primary/90",
                        )}
                      >
                        {row.label}
                      </span>
                    </div>

                    <div className="mt-[2px] flex flex-wrap items-center gap-1.5">
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
                <div className="h-[4px] w-20 overflow-hidden rounded-full bg-border/40">
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

        <div className="flex shrink-0 items-center justify-end gap-2">
          {row.type === "task" && row.childIds.length > 0 ? (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              <Layers3 className="mr-1 size-2.5" />
              {row.childIds.length}
            </Badge>
          ) : null}

          {showStatus ? (
            row.type !== "sprint" ? (
              <Badge
                variant="outline"
                className={cn(
                  "h-6 min-w-[112px] justify-center rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide",
                  getTaskStatusBadgeClass(row.status),
                )}
              >
                {row.statusLabel}
              </Badge>
            ) : (
              <div className="w-[112px]" />
            )
          ) : null}

          {showAssignee ? (
            <div className="flex w-[88px] justify-center">
              {row.type === "task" && assignee ? (
                <AssigneeHoverPill
                  assignee={assignee}
                  avatarSizeClass="size-7"
                  className="shrink-0"
                />
              ) : (
                <span className="size-7" />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
