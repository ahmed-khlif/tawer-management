"use client";

import { useRef, useCallback, useMemo, useState, useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { GanttChart } from "@/modules/projects/types/project-milestones";
import type { GanttRow } from "@/modules/projects/types/gantt";
import { dateToPixel } from "@/modules/projects/utils/gantt-helpers";

import GanttEmptyState from "./gantt-empty-state";
import GanttHeader from "./gantt-header";
import GanttLeftPanel from "./gantt-left-panel";
import GanttLegend from "./gantt-legend";
import GanttRightPanel from "./gantt-right-panel";
import GanttToolbar from "./gantt-toolbar";
import { useGanttScrollSync } from "./hooks/use-gantt-scroll-sync";
import { useGanttState } from "./hooks/use-gantt-state";

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
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useGanttScrollSync(leftScrollRef, rightScrollRef, rightHeaderRef);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleRowClick = useCallback(
    (row: GanttRow) => {
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
    },
    [onRowActivate, rightScrollRef, visibleRows, viewport],
  );

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
      console.error("Failed to toggle Gantt fullscreen", error);
    }
  }, []);

  const summary = useMemo(
    () => ({
      sprints: data.sprints.length,
      epics: data.epics.length,
      tasks: data.tasks.length,
    }),
    [data],
  );

  if (isLoading) {
    return <Skeleton className="h-[460px] w-full rounded-2xl" />;
  }

  if (visibleRows.length === 0) {
    return <GanttEmptyState />;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={fullscreenRef}
        className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
      >
        <GanttToolbar
          zoom={zoom}
          onZoomChange={setZoom}
          onScrollToToday={handleScrollToToday}
          summary={summary}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />

        <div
          className="flex flex-1 overflow-hidden bg-background"
          style={{ minHeight: 460 }}
        >
          <div
            className="shrink-0 border-r border-border/70 bg-card/95 shadow-[6px_0_18px_hsl(var(--foreground)/0.03)]"
            style={{ width: LEFT_PANEL_WIDTH }}
          >
            <div className="flex h-full flex-col overflow-hidden">
              <div
                className="flex items-end border-b border-border/70 bg-muted/35 px-4 pb-2 shrink-0"
                style={{ height: 56 }}
              >
                <div className="flex-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Task Name
                </div>
                <div className="w-[92px] text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Status
                </div>
              </div>

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
          </div>

          <div className="relative flex flex-1 flex-col overflow-hidden">
            <div
              ref={rightHeaderRef}
              className="shrink-0 overflow-hidden border-b border-border/70 bg-background shadow-sm"
              style={{ height: 56 }}
            >
              <GanttHeader viewport={viewport} />
            </div>

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
