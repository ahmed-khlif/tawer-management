"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { addDays, differenceInCalendarDays } from "date-fns";

import type { GanttChart } from "@/modules/projects/types/project-milestones";
import type { GanttRow, GanttViewport, GanttZoom } from "@/modules/projects/types/gantt";
import {
  buildGanttRows,
  computeViewportRange,
  dateToPixel,
  getPixelsPerDay,
} from "@/modules/projects/utils/gantt-helpers";

export function useGanttState(gantt: GanttChart) {
  const [zoom, setZoom] = useState<GanttZoom>("week");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // ── Viewport ────────────────────────────────────────────────────────────
  const viewport = useMemo((): GanttViewport => {
    const { start, end } = computeViewportRange(gantt);
    const pixelsPerDay = getPixelsPerDay(zoom);
    const totalDays = differenceInCalendarDays(end, start) + 14;
    const paddedStart = addDays(start, -7);
    return {
      zoom,
      startDate: paddedStart,
      endDate: addDays(paddedStart, totalDays),
      pixelsPerDay,
      totalDays,
      totalWidth: totalDays * pixelsPerDay,
    };
  }, [zoom, gantt]);

  // ── Rows ────────────────────────────────────────────────────────────────
  const visibleRows = useMemo<GanttRow[]>(
    () => buildGanttRows(gantt, collapsedIds),
    [gantt, collapsedIds],
  );

  // ── Today position ──────────────────────────────────────────────────────
  const todayPosition = useMemo(
    () => dateToPixel(new Date(), viewport),
    [viewport],
  );

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleToggleCollapse = useCallback((rowId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }, []);

  const handleScrollToToday = useCallback(() => {
    const el = rightScrollRef.current;
    if (!el) return;
    const target = todayPosition - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [todayPosition]);

  // Auto-scroll to today on mount
  useEffect(() => {
    const id = setTimeout(handleScrollToToday, 120);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    zoom,
    setZoom,
    viewport,
    visibleRows,
    collapsedIds,
    setCollapsedIds,
    todayPosition,
    rightScrollRef,
    handleToggleCollapse,
    handleScrollToToday,
  };
}
