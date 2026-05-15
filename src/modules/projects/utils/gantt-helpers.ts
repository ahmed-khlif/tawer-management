import {
  addDays,
  differenceInCalendarDays,
  format,
  getWeek,
  isSameDay,
  isWeekend,
} from "date-fns";

import type {
  GanttBar,
  GanttDateColumn,
  GanttRow,
  GanttViewport,
  GanttZoom,
} from "../types/gantt";
import type {
  GanttChart,
  GanttEpic,
  GanttTask,
} from "../types/project-milestones";

export function getPixelsPerDay(zoom: GanttZoom): number {
  switch (zoom) {
    case "day":
      return 48;
    case "week":
      return 28;
    case "month":
      return 10;
  }
}

export function dateToPixel(date: Date, viewport: GanttViewport): number {
  return (
    differenceInCalendarDays(date, viewport.startDate) * viewport.pixelsPerDay
  );
}

export function pixelToDate(px: number, viewport: GanttViewport): Date {
  const dayOffset = Math.round(px / viewport.pixelsPerDay);
  return addDays(viewport.startDate, dayOffset);
}

export function buildDateColumns(viewport: GanttViewport): GanttDateColumn[] {
  const cols: GanttDateColumn[] = [];
  const today = new Date();

  for (let i = 0; i < viewport.totalDays; i++) {
    const date = addDays(viewport.startDate, i);
    cols.push({
      date,
      label: formatColumnLabel(date, viewport.zoom),
      isToday: isSameDay(date, today),
      isWeekend: isWeekend(date),
      isMonthStart: date.getDate() === 1,
      colSpan: 1,
    });
  }

  return cols;
}

export function formatColumnLabel(date: Date, zoom: GanttZoom): string {
  switch (zoom) {
    case "day":
      return format(date, "EEE dd");
    case "week":
      return format(date, "dd");
    case "month":
      return `W${getWeek(date)}`;
  }
}

const STATUS_TO_CATEGORY: Record<string, GanttRow["statusCategory"]> = {
  BACKLOG: "todo",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  TESTING: "review",
  IN_REVIEW: "review",
  DONE: "done",
  COMPLETED: "done",
  OVERDUE: "in_progress",
  PENDING: "todo",
  IN_PROGRESS_MILESTONE: "in_progress",
};

export function resolveStatusCategory(
  status: string,
): GanttRow["statusCategory"] {
  return STATUS_TO_CATEGORY[status.toUpperCase()] ?? "todo";
}

export function getStatusDotVar(
  category: GanttRow["statusCategory"],
): string {
  switch (category) {
    case "todo":
      return "var(--pm-task-backlog-dot)";
    case "in_progress":
      return "var(--pm-task-in-progress-dot)";
    case "done":
      return "var(--pm-task-done-dot)";
    case "cancelled":
      return "var(--pm-task-backlog-dot)";
    case "review":
      return "var(--pm-task-in-review-dot)";
  }
}

export function getTaskStatusBadgeClass(status: string): string {
  const key = status.toLowerCase().replace(/_/g, "-");
  return `pm-badge-task-${key}`;
}

export function buildGanttRows(
  gantt: GanttChart,
  collapsedIds: Set<string>,
): GanttRow[] {
  const rows: GanttRow[] = [];
  const { sprints, epics, tasks, milestones } = gantt;

  const rootTasksBySprint = new Map<string, GanttTask[]>();
  const rootTasksByEpic = new Map<string, GanttTask[]>();
  const childTasksByParent = new Map<string, GanttTask[]>();
  const unassignedRootTasks: GanttTask[] = [];

  for (const task of tasks) {
    if (task.parentTaskId) {
      const children = childTasksByParent.get(task.parentTaskId) ?? [];
      children.push(task);
      childTasksByParent.set(task.parentTaskId, children);
      continue;
    }

    if (task.sprintId) {
      const sprintTasks = rootTasksBySprint.get(task.sprintId) ?? [];
      sprintTasks.push(task);
      rootTasksBySprint.set(task.sprintId, sprintTasks);
    }

    if (task.epicId) {
      const epicTasks = rootTasksByEpic.get(task.epicId) ?? [];
      epicTasks.push(task);
      rootTasksByEpic.set(task.epicId, epicTasks);
    }

    if (!task.sprintId && !task.epicId) {
      unassignedRootTasks.push(task);
    }
  }

  let sprintIndex = 1;
  for (const sprint of sprints) {
    const sprintRowId = `sprint-${sprint.id}`;
    const sprintRootTasks = rootTasksBySprint.get(sprint.id) ?? [];
    const sprintTasks = sprintRootTasks.flatMap((task) => [
      task,
      ...collectDescendants(task.id, childTasksByParent),
    ]);
    const doneTasks = sprintTasks.filter(
      (task) => resolveStatusCategory(task.status) === "done",
    );
    const progress =
      sprintTasks.length > 0
        ? Math.round((doneTasks.length / sprintTasks.length) * 100)
        : 0;

    const epicIds = [
      ...new Set(sprintRootTasks.map((task) => task.epicId).filter(Boolean)),
    ] as string[];

    let sprintStart = sprint.startDate ? new Date(sprint.startDate) : undefined;
    let sprintEnd = sprint.endDate ? new Date(sprint.endDate) : undefined;

    if (!sprintStart || Number.isNaN(sprintStart.getTime())) {
      const validStarts = sprintTasks
        .map((task) => resolveTaskStartDate(task))
        .filter((date): date is Date => !!date && !Number.isNaN(date.getTime()));
      sprintStart = validStarts.length
        ? new Date(Math.min(...validStarts.map((date) => date.getTime())))
        : new Date();
    }

    if (!sprintEnd || Number.isNaN(sprintEnd.getTime())) {
      const validEnds = sprintTasks
        .map((task) => resolveTaskEndDate(task))
        .filter((date): date is Date => !!date && !Number.isNaN(date.getTime()));
      sprintEnd = validEnds.length
        ? new Date(Math.max(...validEnds.map((date) => date.getTime())))
        : addDays(sprintStart, 14);
    }

    rows.push({
      id: sprintRowId,
      type: "sprint",
      label:
        sprint.name ||
        formatSprintLabel(
          sprint.startDate ? new Date(sprint.startDate) : null,
          sprint.endDate ? new Date(sprint.endDate) : null,
          sprintIndex++,
        ),
      itemTypeLabel: "Sprint",
      depth: 0,
      isCollapsed: collapsedIds.has(sprintRowId),
      isCollapsible: sprintTasks.length > 0 || epicIds.length > 0,
      startDate: sprintStart,
      endDate: sprintEnd,
      color: null,
      status: sprint.status,
      statusLabel: sprint.status,
      statusCategory: resolveStatusCategory(sprint.status),
      progress,
      parentId: null,
      childIds: [],
      dependencies: [],
      childTaskCount: sprintTasks.length,
      originalId: sprint.id,
    });

    if (collapsedIds.has(sprintRowId)) continue;

    for (const epicId of epicIds) {
      const epic = epics.find((item) => item.id === epicId);
      if (!epic) continue;
      pushEpicRow(
        rows,
        epic,
        sprintRowId,
        1,
        collapsedIds,
        rootTasksByEpic,
        childTasksByParent,
      );
    }

    const directTasks = sprintRootTasks.filter((task) => !task.epicId);
    for (const task of directTasks) {
      pushTaskRow(rows, task, sprintRowId, 1, childTasksByParent, collapsedIds);
    }
  }

  const sprintEpicIds = new Set<string>();
  for (const task of tasks) {
    if (task.sprintId && task.epicId) sprintEpicIds.add(task.epicId);
  }

  for (const epic of epics) {
    if (sprintEpicIds.has(epic.id)) continue;
    pushEpicRow(
      rows,
      epic,
      null,
      0,
      collapsedIds,
      rootTasksByEpic,
      childTasksByParent,
    );
  }

  for (const milestone of milestones) {
    rows.push({
      id: `milestone-${milestone.id}`,
      type: "milestone",
      label: milestone.name,
      itemTypeLabel: "Milestone",
      depth: 0,
      isCollapsed: false,
      isCollapsible: false,
      startDate: milestone.dueDate ? new Date(milestone.dueDate) : new Date(),
      endDate: milestone.dueDate
        ? new Date(milestone.dueDate)
        : addDays(new Date(), 1),
      color: null,
      status: milestone.status,
      statusLabel: milestone.status.replace(/_/g, " "),
      statusCategory: resolveStatusCategory(milestone.status),
      progress: milestone.status === "COMPLETED" ? 100 : 0,
      parentId: null,
      childIds: [],
      dependencies: [],
      originalId: milestone.id,
    });
  }

  for (const task of unassignedRootTasks) {
    pushTaskRow(rows, task, null, 1, childTasksByParent, collapsedIds);
  }

  return rows;
}

function formatSprintLabel(
  startDate: Date | null,
  endDate: Date | null,
  fallbackIndex: number,
): string {
  if (startDate && endDate) {
    return `Sprint ${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`;
  }
  if (startDate) {
    return `Sprint from ${format(startDate, "MMM d")}`;
  }
  return `Sprint ${fallbackIndex}`;
}

function collectDescendants(
  taskId: string,
  childTasksByParent: Map<string, GanttTask[]>,
): GanttTask[] {
  const directChildren = childTasksByParent.get(taskId) ?? [];
  return directChildren.flatMap((child) => [
    child,
    ...collectDescendants(child.id, childTasksByParent),
  ]);
}

function pushEpicRow(
  rows: GanttRow[],
  epic: GanttEpic,
  parentId: string | null,
  depth: number,
  collapsedIds: Set<string>,
  tasksByEpic: Map<string, GanttTask[]>,
  childTasksByParent: Map<string, GanttTask[]>,
) {
  const epicRowId = `epic-${epic.id}`;
  const epicRootTasks = tasksByEpic.get(epic.id) ?? [];
  const epicTasks = epicRootTasks.flatMap((task) => [
    task,
    ...collectDescendants(task.id, childTasksByParent),
  ]);
  const doneTasks = epicTasks.filter(
    (task) => resolveStatusCategory(task.status) === "done",
  );
  const progress =
    epicTasks.length > 0
      ? Math.round((doneTasks.length / epicTasks.length) * 100)
      : 0;

  rows.push({
    id: epicRowId,
    type: "epic",
    label: epic.name,
    itemTypeLabel: "Epic",
    depth,
    isCollapsed: collapsedIds.has(epicRowId),
    isCollapsible: epicRootTasks.length > 0,
    startDate: epic.startDate ? new Date(epic.startDate) : new Date(),
    endDate: epic.endDate ? new Date(epic.endDate) : addDays(new Date(), 7),
    color: null,
    status: progress === 100 ? "DONE" : progress > 0 ? "IN_PROGRESS" : "TODO",
    statusLabel:
      progress === 100 ? "Done" : progress > 0 ? "In Progress" : "Todo",
    statusCategory:
      progress === 100 ? "done" : progress > 0 ? "in_progress" : "todo",
    progress,
    parentId,
    childIds: epicRootTasks.map((task) => `task-${task.id}`),
    dependencies: [],
    childTaskCount: epicTasks.length,
    originalId: epic.id,
  });

  if (collapsedIds.has(epicRowId)) return;

  for (const task of epicRootTasks) {
    pushTaskRow(rows, task, epicRowId, depth + 1, childTasksByParent, collapsedIds);
  }
}

function pushTaskRow(
  rows: GanttRow[],
  task: GanttTask,
  parentId: string | null,
  depth: number,
  childTasksByParent: Map<string, GanttTask[]>,
  collapsedIds: Set<string>,
) {
  const rowId = `task-${task.id}`;
  const statusCategory = resolveStatusCategory(task.status);
  const childTasks = childTasksByParent.get(task.id) ?? [];
  const startDate = resolveTaskStartDate(task) ?? new Date();
  const endDate = resolveTaskEndDate(task) ?? addDays(startDate, 1);

  rows.push({
    id: rowId,
    type: "task",
    label: task.title,
    keyLabel: task.key,
    itemTypeLabel: task.parentTaskId ? "Subtask" : task.type,
    depth,
    isCollapsed: collapsedIds.has(rowId),
    isCollapsible: childTasks.length > 0,
    startDate,
    endDate,
    color: null,
    status: task.status,
    statusLabel: task.status.replace(/_/g, " "),
    statusCategory,
    progress:
      statusCategory === "done" ? 100 : statusCategory === "in_progress" ? 50 : 0,
    parentId,
    childIds: childTasks.map((child) => `task-${child.id}`),
    dependencies: (task.dependencyIds ?? []).map((dependencyId) => ({
      fromRowId: `task-${dependencyId}`,
      toRowId: rowId,
      type: "finish_to_start",
    })),
    dependencyCount: task.dependencyIds?.length ?? 0,
    childTaskCount: childTasks.length,
    originalId: task.id,
  });

  if (collapsedIds.has(rowId)) return;

  for (const child of childTasks) {
    pushTaskRow(
      rows,
      child,
      rowId,
      depth + 1,
      childTasksByParent,
      collapsedIds,
    );
  }
}

function resolveTaskStartDate(task: GanttTask): Date | null {
  if (task.startDate) return new Date(task.startDate);
  if (task.createdAt) return new Date(task.createdAt);
  if (task.dueDate) return addDays(new Date(task.dueDate), -2);
  return null;
}

function resolveTaskEndDate(task: GanttTask): Date | null {
  if (task.completedAt) return new Date(task.completedAt);
  if (task.dueDate) return new Date(task.dueDate);
  const startDate = resolveTaskStartDate(task);
  return startDate ? addDays(startDate, 1) : null;
}

const ROW_HEIGHT = 44;

export function computeBar(
  row: GanttRow,
  viewport: GanttViewport,
  rowIndex: number,
): GanttBar | null {
  if (!row.startDate || !row.endDate) return null;

  const left = dateToPixel(row.startDate, viewport);
  const span = Math.max(
    differenceInCalendarDays(row.endDate, row.startDate),
    1,
  );
  const width = span * viewport.pixelsPerDay;

  const color =
    row.type === "epic" && row.color
      ? row.color
      : getStatusDotVar(row.statusCategory);

  return {
    rowId: row.id,
    left,
    width: Math.max(width, viewport.pixelsPerDay),
    top: rowIndex * ROW_HEIGHT,
    color,
    label: row.label,
    isResizable: row.type === "task" || row.type === "epic",
    isDraggable: row.type !== "milestone",
  };
}

export function computeDependencyPath(fromBar: GanttBar, toBar: GanttBar): string {
  const fromX = fromBar.left + fromBar.width;
  const fromY = fromBar.top + ROW_HEIGHT / 2;
  const toX = toBar.left;
  const toY = toBar.top + ROW_HEIGHT / 2;

  if (toX > fromX) {
    const cpOffset = Math.min(40, (toX - fromX) / 2);
    return `M ${fromX} ${fromY} C ${fromX + cpOffset} ${fromY} ${toX - cpOffset} ${toY} ${toX} ${toY}`;
  }

  const gap = 20;
  const belowY = Math.max(fromY, toY) + ROW_HEIGHT;
  return [
    `M ${fromX} ${fromY}`,
    `L ${fromX + gap} ${fromY}`,
    `L ${fromX + gap} ${belowY}`,
    `L ${toX - gap} ${belowY}`,
    `L ${toX - gap} ${toY}`,
    `L ${toX} ${toY}`,
  ].join(" ");
}

export function computeViewportRange(
  gantt: GanttChart,
): { start: Date; end: Date } {
  const dates: Date[] = [];

  for (const sprint of gantt.sprints) {
    if (sprint.startDate) dates.push(new Date(sprint.startDate));
    if (sprint.endDate) dates.push(new Date(sprint.endDate));
  }
  for (const epic of gantt.epics) {
    if (epic.startDate) dates.push(new Date(epic.startDate));
    if (epic.endDate) dates.push(new Date(epic.endDate));
  }
  for (const task of gantt.tasks) {
    if (task.startDate) dates.push(new Date(task.startDate));
    if (task.dueDate) dates.push(new Date(task.dueDate));
    if (task.completedAt) dates.push(new Date(task.completedAt));
    if (task.createdAt) dates.push(new Date(task.createdAt));
  }
  for (const milestone of gantt.milestones) {
    if (milestone.dueDate) dates.push(new Date(milestone.dueDate));
    if (milestone.completedAt) dates.push(new Date(milestone.completedAt));
  }

  if (dates.length === 0) {
    const today = new Date();
    return { start: addDays(today, -14), end: addDays(today, 30) };
  }

  const min = dates.reduce((a, b) => (a < b ? a : b));
  const max = dates.reduce((a, b) => (a > b ? a : b));

  return {
    start: addDays(min, -7),
    end: addDays(max, 7),
  };
}
