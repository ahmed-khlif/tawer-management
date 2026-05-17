"use client";

import type { GanttRow } from "@/modules/projects/types/gantt";
import GanttRowLabel from "./gantt-row-label";

interface GanttLeftPanelProps {
  rows: GanttRow[];
  activeRowId?: string | null;
  onToggleCollapse: (rowId: string) => void;
  onRowClick: (row: GanttRow) => void;
}

export default function GanttLeftPanel({
  rows,
  activeRowId,
  onToggleCollapse,
  onRowClick,
}: GanttLeftPanelProps) {
  return (
    <div className="bg-card/95">
      {rows.map((row) => (
        <GanttRowLabel
          key={row.id}
          row={row}
          isActive={activeRowId === row.id}
          onToggleCollapse={onToggleCollapse}
          onRowClick={onRowClick}
        />
      ))}
    </div>
  );
}
