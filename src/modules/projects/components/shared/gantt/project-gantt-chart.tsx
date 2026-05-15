"use client";

import { useRef, useCallback, useState } from "react";
import type { GanttChart } from "@/modules/projects/types/project-milestones";
import type { GanttRow } from "@/modules/projects/types/gantt";
import { useGanttState } from "./hooks/use-gantt-state";
import { useGanttScrollSync } from "./hooks/use-gantt-scroll-sync";
import { dateToPixel } from "@/modules/projects/utils/gantt-helpers";
import GanttToolbar from "./gantt-toolbar";
import GanttHeader from "./gantt-header";
import GanttLeftPanel from "./gantt-left-panel";
import GanttRightPanel from "./gantt-right-panel";
import GanttLegend from "./gantt-legend";
import GanttEmptyState from "./gantt-empty-state";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectGanttChartProps {
  data: GanttChart;
  isLoading?: boolean;
  projectId?: string;
  onRowActivate?: (row: GanttRow) => void;
}

const ROW_HEIGHT = 44;
const LEFT_PANEL_WIDTH = 380;

export default function ProjectGanttChart({
  data,
  isLoading,
  projectId: _projectId,
  onRowActivate,
}: ProjectGanttChartProps) {
  const {
    zoom,
    setZoom,
    viewport,
    visibleRows,
    handleScrollToToday,
    todayPosition,
    rightScrollRef,
    collapsedIds,
    setCollapsedIds,
  } = useGanttState(data);

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightHeaderRef = useRef<HTMLDivElement>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  // Sync scroll
  useGanttScrollSync(leftScrollRef, rightScrollRef, rightHeaderRef);

  // ── Row click handler ───────────────────────────────────────────────────
  const handleRowClick = useCallback((row: GanttRow) => {
    const right = rightScrollRef.current;
    const left = leftScrollRef.current;
    const rowIndex = visibleRows.findIndex((item) => item.id === row.id);

    setActiveRowId(row.id);

    if (right && rowIndex >= 0) {
      const topTarget = Math.max(
        0,
        rowIndex * ROW_HEIGHT - right.clientHeight * 0.35,
      );
      const leftTarget = row.startDate
        ? Math.max(
            0,
            dateToPixel(row.startDate, viewport) - right.clientWidth * 0.28,
          )
        : right.scrollLeft;

      right.scrollTo({
        top: topTarget,
        left: leftTarget,
        behavior: "smooth",
      });
    }

    if (left && rowIndex >= 0) {
      left.scrollTo({
        top: Math.max(0, rowIndex * ROW_HEIGHT - left.clientHeight * 0.35),
        behavior: "smooth",
      });
    }
    onRowActivate?.(row);
  }, [onRowActivate, rightScrollRef, visibleRows, viewport]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return <Skeleton className="h-[460px] w-full rounded-2xl" />;
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (visibleRows.length === 0) {
    return <GanttEmptyState />;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        {/* Toolbar */}
        <GanttToolbar
          zoom={zoom}
          onZoomChange={setZoom}
          onScrollToToday={handleScrollToToday}
        />
        {/* Main Gantt Canvas */}
        <div
          className="flex flex-1 overflow-hidden bg-background"
          style={{ minHeight: 460 }}
        >
          {/* ── Left panel (frozen) ──────────────────────────────────────── */}
          <div
            className="shrink-0 border-r border-border/70 flex flex-col overflow-hidden bg-card/95"
            style={{ width: LEFT_PANEL_WIDTH }}
          >
            <div
              className="flex items-end border-b border-border/70 bg-muted/40 px-4 pb-2 shrink-0"
              style={{ height: 56 }}
            >
              <div className="flex-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Name
              </div>
              <div className="w-[92px] text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Status
              </div>
            </div>
            {/* Left rows */}
            <div
              ref={leftScrollRef}
              className="flex-1 overflow-y-auto overflow-x-hidden"
              style={{ scrollbarWidth: "thin" }}
            >
              <GanttLeftPanel
                rows={visibleRows}
                activeRowId={activeRowId}
                onToggleCollapse={(id) => {
                  const next = new Set(collapsedIds);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  setCollapsedIds(next);
                }}
                onRowClick={handleRowClick}
              />
            </div>
          </div>

          {/* ── Right panel (scrollable) ─────────────────────────────────── */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            <div
              ref={rightHeaderRef}
              className="overflow-hidden shrink-0 border-b border-border/70 bg-background"
              style={{ height: 56 }}
            >
              <GanttHeader viewport={viewport} />
            </div>
            {/* Timeline canvas — scrollable in both directions */}
            <div
              ref={rightScrollRef}
              className="flex-1 overflow-auto bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.08)_100%)]"
              style={{ scrollbarWidth: "thin" }}
            >
              <GanttRightPanel
                rows={visibleRows}
                viewport={viewport}
                rowHeight={ROW_HEIGHT}
                todayPosition={todayPosition}
                activeRowId={activeRowId}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <GanttLegend />
        <div className="flex items-center justify-end gap-2 border-t border-border/50 bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
          <span>Scroll down for more rows</span>
          <span className="text-muted-foreground/50">•</span>
          <span>Shift + Scroll to pan horizontally</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
