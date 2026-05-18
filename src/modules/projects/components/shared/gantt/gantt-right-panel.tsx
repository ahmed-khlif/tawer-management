"use client";

import { useMemo } from "react";
import type { GanttBar, GanttRow, GanttViewport } from "@/modules/projects/types/gantt";
import { computeBar } from "@/modules/projects/utils/gantt-helpers";
import GanttBarElement from "./gantt-bar";
import GanttTodayLine from "./gantt-today-line";
import GanttDependencyArrows from "./gantt-dependency-arrows";

interface GanttRightPanelProps {
  rows: GanttRow[];
  viewport: GanttViewport;
  rowHeight: number;
  todayPosition: number;
  activeRowId?: string | null;
  onRowClick: (row: GanttRow) => void;
}

export default function GanttRightPanel({
  rows,
  viewport,
  rowHeight,
  todayPosition,
  activeRowId,
  onRowClick,
}: GanttRightPanelProps) {
  const totalHeight = rows.length * rowHeight;

  const { bars, barMap } = useMemo(() => {
    const list: { bar: GanttBar; row: GanttRow }[] = [];
    const map = new Map<string, GanttBar>();

    rows.forEach((row, i) => {
      const bar = computeBar(row, viewport, i);
      if (bar) {
        list.push({ bar, row });
        map.set(row.id, bar);
      }
    });

    return { bars: list, barMap: map };
  }, [rows, viewport]);

  return (
    <div
      className="relative"
      style={{
        width: viewport.totalWidth,
        height: totalHeight,
        backgroundImage:
          viewport.zoom === "month"
            ? "none"
            : `linear-gradient(to right, transparent ${viewport.pixelsPerDay - 1}px, hsl(var(--border) / 0.32) ${viewport.pixelsPerDay - 1}px)`,
        backgroundSize: `${viewport.pixelsPerDay}px 100%`,
      }}
    >
      {rows.map((row, i) => (
        <div
          key={row.id}
          className="absolute left-0 right-0 border-b border-border/20 transition-colors"
          style={{
            top: i * rowHeight,
            height: rowHeight,
            backgroundColor:
              activeRowId === row.id
                ? "hsl(var(--primary) / 0.08)"
                : i % 2 === 1
                  ? "hsl(var(--muted) / 0.55)"
                  : "transparent",
            opacity: activeRowId === row.id ? 1 : i % 2 === 1 ? 0.15 : 1,
          }}
        />
      ))}

      <GanttTodayLine position={todayPosition} totalHeight={totalHeight} />

      <GanttDependencyArrows
        bars={barMap}
        rows={rows}
        totalWidth={viewport.totalWidth}
        totalHeight={totalHeight}
      />

      {bars.map(({ bar, row }) => (
        <GanttBarElement
          key={bar.rowId}
          bar={bar}
          row={row}
          isActive={activeRowId === row.id}
          rowHeight={rowHeight}
          onClick={onRowClick}
        />
      ))}
    </div>
  );
}
