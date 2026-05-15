export type GanttZoom = "day" | "week" | "month";

export type GanttRowType = "sprint" | "epic" | "milestone" | "task";

export interface GanttAssignee {
  id: string;
  name: string;
  avatar: string | null;
  initials: string;
}

export interface GanttDependency {
  fromRowId: string;
  toRowId: string;
  type: "finish_to_start" | "start_to_start" | "finish_to_finish";
}

export interface GanttRow {
  id: string;
  type: GanttRowType;
  label: string;
  keyLabel?: string | null;
  itemTypeLabel?: string | null;
  depth: number;
  isCollapsed: boolean;
  isCollapsible: boolean;
  startDate: Date | null;
  endDate: Date | null;
  color: string | null;
  status: string;
  statusLabel: string;
  statusCategory: "todo" | "in_progress" | "done" | "cancelled" | "review";
  progress: number;
  parentId: string | null;
  childIds: string[];
  dependencies: GanttDependency[];
  dependencyCount?: number;
  childTaskCount?: number;
  originalId: string;
}

export interface GanttDateColumn {
  date: Date;
  label: string;
  isToday: boolean;
  isWeekend: boolean;
  isMonthStart: boolean;
  colSpan: number;
}

export interface GanttViewport {
  zoom: GanttZoom;
  startDate: Date;
  endDate: Date;
  pixelsPerDay: number;
  totalDays: number;
  totalWidth: number;
}

export interface GanttBar {
  rowId: string;
  left: number;
  width: number;
  top: number;
  color: string;
  label: string;
  isResizable: boolean;
  isDraggable: boolean;
}
