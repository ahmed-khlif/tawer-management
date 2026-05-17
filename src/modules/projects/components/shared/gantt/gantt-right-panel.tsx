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
  const externalLabelThreshold = 132;

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
      {/* Row alternating stripes */}
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

      {/* Today line */}
      <GanttTodayLine position={todayPosition} totalHeight={totalHeight} />

      {/* Dependency arrows */}
      <GanttDependencyArrows
        bars={barMap}
        rows={rows}
        totalWidth={viewport.totalWidth}
        totalHeight={totalHeight}
      />

      {/* Bars */}
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

      {bars
        .filter(
          ({ bar, row }) =>
            row.type === "task" && bar.width < externalLabelThreshold,
        )
        .map(({ bar, row }) => {
          const estimatedWidth = Math.min(
            Math.max((row.label.length + (row.keyLabel ? row.keyLabel.length + 3 : 0)) * 7, 120),
            280,
          );
          const preferLeft =
            bar.left + bar.width + estimatedWidth + 26 > viewport.totalWidth;
          const labelLeft = preferLeft
            ? Math.max(8, bar.left - estimatedWidth - 14)
            : bar.left + bar.width + 10;
          const connectorLeft = preferLeft ? labelLeft + estimatedWidth + 4 : bar.left + bar.width + 2;

          return (
            <div
              key={`${bar.rowId}-task-label`}
              className="absolute z-[4]"
              style={{
                top: bar.top + rowHeight / 2 - 12,
                left: 0,
                width: viewport.totalWidth,
                pointerEvents: "none",
              }}
            >
              <div
                className="absolute top-1/2 h-px border-t border-dashed border-primary/35"
                style={{
                  left: preferLeft ? labelLeft + estimatedWidth : connectorLeft,
                  width: preferLeft
                    ? Math.max(8, bar.left - (labelLeft + estimatedWidth) - 2)
                    : Math.max(8, labelLeft - connectorLeft - 2),
                }}
              />
              <button
                type="button"
                onClick={() => onRowClick(row)}
                className="absolute flex max-w-[280px] items-center gap-1.5 truncate rounded-lg border border-border/70 bg-background/96 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-md backdrop-blur-sm transition-all hover:border-primary/45 hover:bg-primary/5"
                style={{
                  left: labelLeft,
                  pointerEvents: "auto",
                  boxShadow:
                    activeRowId === row.id
                      ? "0 0 0 2px hsl(var(--primary) / 0.12)"
                      : undefined,
                }}
              >
                {row.keyLabel ? (
                  <span className="shrink-0 rounded bg-muted px-1 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
                    {row.keyLabel}
                  </span>
                ) : null}
                <span className="truncate">{row.label}</span>
              </button>
            </div>
          );
        })}
    </div>
  );
}
