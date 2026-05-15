"use client";

import type { GanttBar, GanttRow } from "@/modules/projects/types/gantt";
import { computeDependencyPath } from "@/modules/projects/utils/gantt-helpers";

interface GanttDependencyArrowsProps {
  bars: Map<string, GanttBar>;
  rows: GanttRow[];
  totalWidth: number;
  totalHeight: number;
}

export default function GanttDependencyArrows({
  bars,
  rows,
  totalWidth,
  totalHeight,
}: GanttDependencyArrowsProps) {
  const paths: { key: string; d: string }[] = [];

  for (const row of rows) {
    for (const dep of row.dependencies) {
      const fromBar = bars.get(dep.fromRowId);
      const toBar = bars.get(dep.toRowId);
      if (!fromBar || !toBar) continue;
      paths.push({
        key: `${dep.fromRowId}-${dep.toRowId}`,
        d: computeDependencyPath(fromBar, toBar),
      });
    }
  }

  if (paths.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width={totalWidth}
      height={totalHeight}
      overflow="visible"
    >
      <defs>
        <marker
          id="gantt-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M 0 0 L 6 3 L 0 6 Z"
            fill="var(--muted-foreground)"
            opacity="0.5"
          />
        </marker>
      </defs>
      {paths.map(({ key, d }) => (
        <path
          key={key}
          d={d}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
          opacity="0.5"
          markerEnd="url(#gantt-arrow)"
        />
      ))}
    </svg>
  );
}
