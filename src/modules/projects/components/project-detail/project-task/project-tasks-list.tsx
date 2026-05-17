"use client";
import React from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragStartEvent, type DragEndEvent, DragOverlay
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { ProjectType } from "../../../types/projects";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import useProjectTasks from "../../../hooks/tasks/use-project-tasks";
import useProjectPermissions from "../../../hooks/permissions/use-project-permissions";
import useTaskStatuses from "../../../hooks/tasks/use-task-statuses";
import useProjectKanban from "../../../hooks/tasks/use-project-kanban";
import useProjectTask from "../../../hooks/tasks/use-project-task";
import useProjectSprints from "../../../hooks/sprints/use-project-sprints";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { useProjectTasksStore } from "@/modules/projects/store/project-tasks";
import Error500 from "@/components/error/500";
import ProjectTaskItem from "./project-task-item";
import ProjectTaskUploadSheet from "./project-task-upload";
import ProjectTaskDetailSheet from "./project-task-details-sheet";
import ProjectTasksToolbar from "./project-tasks-toolbar";
import ProjectTasksKanbanBoard from "./project-tasks-kanban-board";
import { EmptyState } from "../../shared/empty-state";
import {
  KanbanBoardSkeleton,
  TaskListSkeleton,
} from "../../shared/skeletons";
import { ListChecks } from "lucide-react";
import PredictionFeedbackDialog from "@/modules/ai/components/prediction-feedback-dialog";

const NO_STATUS_KEY = "NO_STATUS";

interface Props {
  project: ProjectType;
}

export default function ProjectTasksList({ project }: Props) {
  const tTasks = useTranslations("modules.projects.tasks");
  const { viewMode } = useProjectTasksStore();
  const kanbanFullscreenRef = React.useRef<HTMLDivElement | null>(null);

  const {
    tasks, tasksAreLoading, tasksError,
    searchState, statusState, priorityState, typeState,
    assigneeState, milestoneState, epicState, setDisplayedTasks
  } = useProjectTasks(project.id);
  const { canAddTask, canEditAnyTask, canEditOwnTask, canDeleteAnyTask, canDeleteOwnTask, canUpdateStatusAny, canUpdateStatusOwn, canManageTaskStatuses, isOwnTask } = useProjectPermissions(project);
  const { list: customStatusesQuery, createStatus, deleteStatus } = useTaskStatuses(project.id);
  const { moveTask: moveKanbanTask } = useProjectKanban(project.id);
  const { user } = useCurrentUser();
  const { sprints } = useProjectSprints(project.id, {
    enabled: project.projectType === "AGILE",
  });

  const [search, setSearch] = searchState;
  const [status, setStatus] = statusState;
  const [priority, setPriority] = priorityState;
  const [type, setType] = typeState;
  const [assigneeId, setAssigneeId] = assigneeState;
  const [milestoneId, setMilestoneId] = milestoneState;
  const [epicId, setEpicId] = epicState;

  const mineOnly = !!user?.id && assigneeId === user.id;
  const handleToggleMineOnly = React.useCallback(() => {
    if (!user?.id) return;
    setAssigneeId(mineOnly ? undefined : user.id);
  }, [user?.id, mineOnly, setAssigneeId]);

  const activeSprint = React.useMemo(() => {
    if (project.projectType !== "AGILE") return null;
    return (
      sprints.find((sprint) => sprint.status === "Running") ??
      sprints.find((sprint) => sprint.status === "Pending") ??
      null
    );
  }, [project.projectType, sprints]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTaskId = searchParams?.get("taskId");

  const [isAddSheetOpen, setIsAddSheetOpen] = React.useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = React.useState(false);
  const [listActiveId, setListActiveId] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<ProjectTaskType | null>(null);
  const [duplicateTemplate, setDuplicateTemplate] = React.useState<Partial<ProjectTaskType> | null>(null);
  const [feedbackTask, setFeedbackTask] = React.useState<ProjectTaskType | null>(null);
  const [groupBy, setGroupBy] = React.useState<"none" | "assignee" | "epic">(
    "none",
  );
  const [isKanbanFullscreen, setIsKanbanFullscreen] = React.useState(false);
  const requestedTaskQuery = useProjectTask(project.id, requestedTaskId, {
    enabled: !!requestedTaskId,
  });

  React.useEffect(() => {
    const onFullscreenChange = () => {
      const activeElement = document.fullscreenElement;
      setIsKanbanFullscreen(activeElement === kanbanFullscreenRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  React.useEffect(() => {
    const newTaskFlag = searchParams?.get("newTask");
    if (newTaskFlag !== "1") return;
    if (isAddSheetOpen) return;
    const sprintIdParam = searchParams?.get("sprintId") || undefined;
    const milestoneIdParam = searchParams?.get("milestoneId") || undefined;
    setSelectedTask(null);
    setDuplicateTemplate({
      ...(sprintIdParam ? { sprintId: sprintIdParam } : {}),
      ...(milestoneIdParam ? { milestoneId: milestoneIdParam } : {}),
    });
    setIsAddSheetOpen(true);

    const params = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
    params.delete("newTask");
    params.delete("epicId");
    params.delete("sprintId");
    params.delete("milestoneId");
    const next = params.toString();
    router.replace(next ? `?${next}` : "?");
  }, [searchParams, router, isAddSheetOpen]);

  React.useEffect(() => {
    if (!requestedTaskId) return;
    if (!requestedTaskQuery.data) return;

    setSelectedTask(requestedTaskQuery.data);
    setListActiveId(requestedTaskQuery.data.id);
    setIsDetailSheetOpen(true);

    const params = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
    params.delete("taskId");
    const next = params.toString();
    router.replace(next ? `?${next}` : "?");
  }, [requestedTaskId, requestedTaskQuery.data, searchParams, router]);


  // ---------------------------------------------------------------------------
  // Kanban status / column model
  // ---------------------------------------------------------------------------
  // The backend persists every status (system + custom) as a `ProjectTaskStatus`
  // row, ordered by `displayOrder`. System statuses are seeded at project
  // creation (BACKLOG/TODO/IN_PROGRESS/IN_REVIEW/TESTING/DONE for AGILE) with
  // strict allowed transitions; custom statuses are user-defined with the
  // colors and order chosen in project settings.
  //
  // We use this list as the single source of truth for columns:
  //   - column key      = status NAME (e.g. "TODO", "Code Review")
  //   - column order    = `displayOrder`
  //   - column color    = `status.color`
  //   - kanban move PATCH body sends `status: <name>` directly (matches the
  //     backend `MoveTaskInKanbanDto.status` contract).
  //
  // Falls back to a synthetic enum list only for legacy projects whose
  // status table hasn't been seeded yet.
  // Canonical system workflow per project type (matches backend
  // allowedTransitions). Always rendered, in this exact order, so every task
  // with an enum status has a column even if the project's seed rows are
  // missing or the backend only returns custom statuses.
  const systemEnumStatuses = React.useMemo(() => (
    project.projectType === "AGILE"
      ? ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "TESTING", "DONE"]
      : ["TODO", "IN_PROGRESS", "DONE"]
  ), [project.projectType]);

  // Final ordered status list = system enum columns first (in canonical
  // order, populated from backend records when available so we get the
  // configured color and id), followed by every other backend status sorted
  // by `displayOrder`. This guarantees:
  //   - tasks with `status: "TODO"` always land on a TODO column
  //   - custom user-defined statuses still appear and respect their order
  //   - colors come from backend when seeded, else stay blank (Tailwind class)
  const orderedStatuses = React.useMemo(() => {
    const fromBackend = customStatusesQuery.data ?? [];
    const byNameUpper = new Map<string, typeof fromBackend[number]>();
    for (const status of fromBackend) {
      byNameUpper.set(status.name.toUpperCase().replace(/\s+/g, "_"), status);
    }

    const result: Array<{
      id: string;
      projectId: string;
      name: string;
      color: string;
      displayOrder: number;
      isSystem: boolean;
      allowedTransitions: string[];
      createdAt: string;
      updatedAt: string;
    }> = [];
    const consumed = new Set<string>();

    // 1) System enum columns in canonical order.
    systemEnumStatuses.forEach((name, index) => {
      const seeded = byNameUpper.get(name);
      if (seeded) {
        consumed.add(seeded.id);
        result.push({
          id: seeded.id,
          projectId: seeded.projectId,
          name: seeded.name,
          color: seeded.color ?? "",
          displayOrder: index,
          isSystem: true,
          allowedTransitions: seeded.allowedTransitions ?? [],
          createdAt: seeded.createdAt,
          updatedAt: seeded.updatedAt,
        });
      } else {
        result.push({
          id: `enum:${name}`,
          projectId: project.id,
          name,
          color: "",
          displayOrder: index,
          isSystem: true,
          allowedTransitions: [],
          createdAt: "",
          updatedAt: "",
        });
      }
    });

    // 2) Remaining backend statuses (custom or unrecognized system) appended
    //    in their `displayOrder`.
    const remaining = fromBackend
      .filter((s) => !consumed.has(s.id))
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s) => ({
        id: s.id,
        projectId: s.projectId,
        name: s.name,
        color: s.color ?? "",
        displayOrder: s.displayOrder,
        isSystem: s.isSystem,
        allowedTransitions: s.allowedTransitions ?? [],
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));

    return [...result, ...remaining];
  }, [customStatusesQuery.data, systemEnumStatuses, project.id]);

  const orderedStatusNames = React.useMemo(
    () => orderedStatuses.map((status) => status.name),
    [orderedStatuses],
  );

  // Lowercased name → canonical status name. Used to map a task's `status`
  // string (which may differ in casing/spacing) to its column.
  const statusNameByLower = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const status of orderedStatuses) {
      map.set(status.name.trim().toLowerCase(), status.name);
    }
    return map;
  }, [orderedStatuses]);

  // Column titles are just the status names; `tTasks` only translates the
  // "No Status" sentinel column we add when a task has no matching column.
  const columnTitles = React.useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const status of orderedStatuses) {
      map[status.name] = status.name.replace(/_/g, " ");
    }
    map[NO_STATUS_KEY] = tTasks("kanban.noStatus", { defaultValue: "No Status" });
    return map;
  }, [orderedStatuses, tTasks]);

  // Color maps — both keyed by status name. We keep the legacy `byKey` shape
  // for the kanban board prop (column dot) so it doesn't have to know that
  // keys are now names.
  const customStatusColorByKey = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const status of orderedStatuses) {
      if (status.color) map[status.name] = status.color;
    }
    return map;
  }, [orderedStatuses]);

  const customStatusColorByName = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const status of orderedStatuses) {
      if (status.color) map[status.name.trim().toLowerCase()] = status.color;
    }
    return map;
  }, [orderedStatuses]);

  const renderStatusColumnOrder = React.useMemo(() => {
    const keys = [...orderedStatusNames];
    if (!keys.includes(NO_STATUS_KEY)) {
      keys.push(NO_STATUS_KEY);
    }
    return keys;
  }, [orderedStatusNames]);

  const kanbanColumns = React.useMemo(() => {
    const columns: Record<string, ProjectTaskType[]> = {};
    for (const name of orderedStatusNames) columns[name] = [];

    for (const task of tasks) {
      const rawStatus = (task.status ?? "").trim();
      const lower = rawStatus.toLowerCase();
      const normalized = rawStatus.toUpperCase().replace(/\s+/g, "_");

      let key: string;
      if (lower && statusNameByLower.has(lower)) {
        key = statusNameByLower.get(lower)!;
      } else if (columns[normalized]) {
        key = normalized;
      } else {
        key = NO_STATUS_KEY;
      }

      if (columns[key]) columns[key].push(task);
      else if (columns[NO_STATUS_KEY]) columns[NO_STATUS_KEY].push(task);
      else columns[NO_STATUS_KEY] = [task];
    }
    if (columns[NO_STATUS_KEY]?.length === 0 && !orderedStatusNames.includes(NO_STATUS_KEY)) {
      delete columns[NO_STATUS_KEY];
    }
    return columns;
  }, [tasks, orderedStatusNames, statusNameByLower]);

  const activeSprintTasks = React.useMemo(() => {
    if (!activeSprint) return [];
    return tasks.filter((task) => task.sprintId === activeSprint.id);
  }, [activeSprint, tasks]);

  const activeSprintProgress = React.useMemo(() => {
    if (!activeSprint) return null;
    if (activeSprintTasks.length > 0) {
      const completed = activeSprintTasks.filter((task) => task.status === "DONE").length;
      return {
        total: activeSprintTasks.length,
        completed,
        percent: Math.round((completed / Math.max(activeSprintTasks.length, 1)) * 100),
      };
    }

    if (activeSprint.tasks?.length) {
      const completed = activeSprint.tasks.filter((task) => task.status === "DONE").length;
      return {
        total: activeSprint.tasks.length,
        completed,
        percent: Math.round((completed / Math.max(activeSprint.tasks.length, 1)) * 100),
      };
    }

    return {
      total: 0,
      completed: 0,
      percent: 0,
    };
  }, [activeSprint, activeSprintTasks]);

  const activeSprintMembers = React.useMemo(() => {
    if (!activeSprint) return [];

    const ids = Array.from(
      new Set(activeSprintTasks.map((task) => task.assigneeId).filter(Boolean)),
    ) as string[];

    const resolved = ids
      .map((userId) => project.members?.find((member) => member.userId === userId))
      .filter(Boolean);

    if (resolved.length > 0) {
      return resolved.slice(0, 5);
    }

    return (project.members ?? []).slice(0, 5);
  }, [activeSprint, activeSprintTasks, project.members]);

  const activeSprintSummary = React.useMemo(() => {
    if (!activeSprint) return null;
    return {
      id: activeSprint.id,
      name: activeSprint.name,
      status: activeSprint.status,
      dateLabel: `${format(activeSprint.startDate, "MMM d")} - ${format(activeSprint.endDate, "MMM d")}`,
      progressPercent: activeSprintProgress?.percent ?? 0,
      completedTasks: activeSprintProgress?.completed ?? 0,
      totalTasks: activeSprintProgress?.total ?? 0,
      teamMembers: activeSprintMembers
        .filter(
          (member): member is NonNullable<(typeof activeSprintMembers)[number]> =>
            !!member,
        )
        .map((member) => ({
          id: member.id,
          name: member.memberName || member.user?.name || "Team member",
          image: member.user?.image,
        })),
    };
  }, [activeSprint, activeSprintMembers, activeSprintProgress]);

  const assigneeSwimlaneModel = React.useMemo(() => {
    const laneMap = new Map<
      string,
      { id: string; title: string; subtitle?: string; color?: string | null }
    >();

    for (const member of project.members ?? []) {
      if (!member.userId) continue;
      laneMap.set(member.userId, {
        id: member.userId,
        title: member.memberName || member.user?.name || "Team member",
      });
    }

    for (const task of tasks) {
      if (!task.assigneeId) continue;
      if (!laneMap.has(task.assigneeId)) {
        laneMap.set(task.assigneeId, {
          id: task.assigneeId,
          title: task.assignee?.name || task.assigneeId,
        });
      }
    }

    const lanes = [
      ...Array.from(laneMap.values()),
      { id: "unassigned", title: "Unassigned" },
    ];

    const columns: Record<string, ProjectTaskType[]> = {};
    for (const lane of lanes) {
      for (const statusKey of renderStatusColumnOrder) {
        columns[`${lane.id}::${statusKey}`] = [];
      }
    }

    for (const task of tasks) {
      const laneId = task.assigneeId ?? "unassigned";
      const rawStatus = (task.status ?? "").trim();
      const lower = rawStatus.toLowerCase();
      const normalized = rawStatus.toUpperCase().replace(/\s+/g, "_");
      const statusKey = statusNameByLower.get(lower) ?? (columns[`${laneId}::${normalized}`] ? normalized : NO_STATUS_KEY);
      const columnKey = `${laneId}::${statusKey}`;
      if (!columns[columnKey]) {
        columns[columnKey] = [];
      }
      columns[columnKey].push(task);
    }

    return {
      lanes: lanes.map((lane) => ({
        ...lane,
        taskCount: tasks.filter((task) => (task.assigneeId ?? "unassigned") === lane.id)
          .length,
        columns: renderStatusColumnOrder.map((statusKey) => ({
          key: `${lane.id}::${statusKey}`,
          title: columnTitles[statusKey] || statusKey,
        })),
      })),
      columns,
    };
  }, [project.members, tasks, renderStatusColumnOrder, statusNameByLower, columnTitles]);

  const epicSwimlaneModel = React.useMemo(() => {
    const laneMap = new Map<
      string,
      { id: string; title: string; color?: string | null; subtitle?: string }
    >();

    const projectEpics = (project as { epics?: Array<{ id: string; name: string; color?: string | null }> }).epics ?? [];
    for (const epic of projectEpics) {
      laneMap.set(epic.id, {
        id: epic.id,
        title: epic.name,
        color: epic.color ?? null,
      });
    }

    for (const task of tasks) {
      if (!task.epic) continue;
      if (!laneMap.has(task.epic.id)) {
        laneMap.set(task.epic.id, {
          id: task.epic.id,
          title: task.epic.title,
          color: task.epic.color ?? null,
        });
      }
    }

    const lanes = [
      ...Array.from(laneMap.values()),
      { id: "no-epic", title: "No Epic", subtitle: "Standalone tasks", color: null },
    ];

    const columns: Record<string, ProjectTaskType[]> = {};
    for (const lane of lanes) {
      for (const statusKey of renderStatusColumnOrder) {
        columns[`${lane.id}::${statusKey}`] = [];
      }
    }

    for (const task of tasks) {
      const laneId = task.epic?.id ?? "no-epic";
      const rawStatus = (task.status ?? "").trim();
      const lower = rawStatus.toLowerCase();
      const normalized = rawStatus.toUpperCase().replace(/\s+/g, "_");
      const statusKey = statusNameByLower.get(lower) ?? (columns[`${laneId}::${normalized}`] ? normalized : NO_STATUS_KEY);
      const columnKey = `${laneId}::${statusKey}`;
      if (!columns[columnKey]) {
        columns[columnKey] = [];
      }
      columns[columnKey].push(task);
    }

    return {
      lanes: lanes.map((lane) => ({
        ...lane,
        taskCount: tasks.filter((task) => (task.epic?.id ?? "no-epic") === lane.id)
          .length,
        columns: renderStatusColumnOrder.map((statusKey) => ({
          key: `${lane.id}::${statusKey}`,
          title: columnTitles[statusKey] || statusKey,
        })),
      })),
      columns,
    };
  }, [project, tasks, renderStatusColumnOrder, statusNameByLower, columnTitles]);

  const kanbanInteractedRef = React.useRef(false);
  const [localKanbanColumns, setLocalKanbanColumns] = React.useState<Record<string, ProjectTaskType[]>>({});
  const [localAssigneeSwimlaneColumns, setLocalAssigneeSwimlaneColumns] =
    React.useState<Record<string, ProjectTaskType[]>>({});
  const [localEpicSwimlaneColumns, setLocalEpicSwimlaneColumns] =
    React.useState<Record<string, ProjectTaskType[]>>({});
  const dragBufferRef = React.useRef<Record<string, ProjectTaskType[]> | null>(null);
  const isDraggingKanbanRef = React.useRef(false);

  const prevTaskIdsRef = React.useRef<string>("");
  React.useEffect(() => {
    const taskIds = tasks.map(t => t.id).sort().join(",");
    if (taskIds !== prevTaskIdsRef.current) {
      prevTaskIdsRef.current = taskIds;
      kanbanInteractedRef.current = false;
      setLocalKanbanColumns(kanbanColumns);
      setLocalAssigneeSwimlaneColumns(assigneeSwimlaneModel.columns);
      setLocalEpicSwimlaneColumns(epicSwimlaneModel.columns);
    }
  }, [tasks, kanbanColumns, assigneeSwimlaneModel.columns, epicSwimlaneModel.columns]);

  const activeKanbanColumns =
    groupBy === "epic"
      ? kanbanInteractedRef.current
        ? localEpicSwimlaneColumns
        : epicSwimlaneModel.columns
      : groupBy === "assignee"
        ? kanbanInteractedRef.current
          ? localAssigneeSwimlaneColumns
          : assigneeSwimlaneModel.columns
        : kanbanInteractedRef.current
          ? localKanbanColumns
          : kanbanColumns;

  // --- Handlers ---
  const handleOpenDetailSheet = (task: ProjectTaskType) => {
    setSelectedTask(task);
    setIsDetailSheetOpen(true);
  };

  const handleOpenUploadSheet = (task?: ProjectTaskType) => {
    setSelectedTask(task || null);
    setDuplicateTemplate(null);
    setIsDetailSheetOpen(false);
    setIsAddSheetOpen(true);
  };

  const handleDuplicateTask = (task: ProjectTaskType, e: React.MouseEvent) => {
    e.stopPropagation();
    setDuplicateTemplate({
      title: task.title, description: task.description,
      type: task.type, status: task.status, priority: task.priority,
      storyPoints: task.storyPoints, dueDate: new Date().toISOString(),
      assigneeId: task.assigneeId, milestoneId: task.milestoneId,
      sprintId: task.sprintId,
    });
    setSelectedTask(null);
    setIsDetailSheetOpen(false);
    setIsAddSheetOpen(true);
  };

  const handleToggleKanbanFullscreen = React.useCallback(async () => {
    const container = kanbanFullscreenRef.current;
    if (!container || typeof document === "undefined") return;

    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen", error);
      toast.error(
        tTasks("toolbar.fullscreenError", {
          defaultValue: "Fullscreen mode is not available right now.",
        }),
      );
    }
  }, [tTasks]);

  // Kanban drag handlers
  const handleKanbanDragStart = () => { isDraggingKanbanRef.current = true; };
  const handleKanbanDragEnd = () => {
    isDraggingKanbanRef.current = false;
    if (dragBufferRef.current) {
      kanbanInteractedRef.current = true;
      const next = dragBufferRef.current;
      const previous = activeKanbanColumns;
      if (groupBy === "epic") {
        setLocalEpicSwimlaneColumns(next);
      } else if (groupBy === "assignee") {
        setLocalAssigneeSwimlaneColumns(next);
      } else {
        setLocalKanbanColumns(next);
      }
      dragBufferRef.current = null;
      void detectAndPersistMoves(previous, next);
    }
  };
  const handleKanbanChange = (newColumns: Record<string, ProjectTaskType[]>) => {
    if (isDraggingKanbanRef.current) dragBufferRef.current = newColumns;
    else {
      const previous = activeKanbanColumns;
      kanbanInteractedRef.current = true;
      if (groupBy === "epic") {
        setLocalEpicSwimlaneColumns(newColumns);
      } else if (groupBy === "assignee") {
        setLocalAssigneeSwimlaneColumns(newColumns);
      } else {
        setLocalKanbanColumns(newColumns);
      }
      void detectAndPersistMoves(previous, newColumns);
    }
  };

  const detectAndPersistMoves = async (
    previous: Record<string, ProjectTaskType[]>,
    next: Record<string, ProjectTaskType[]>,
  ) => {
    const parseKanbanLocation = (columnKey: string) => {
      if (!columnKey.includes("::")) {
        return { laneKey: null, statusKey: columnKey };
      }
      const [laneKey, statusKey] = columnKey.split("::");
      return { laneKey, statusKey };
    };

    const previousLocation = new Map<
      string,
      { columnKey: string; index: number; laneKey: string | null; statusKey: string }
    >();
    for (const [columnKey, columnTasks] of Object.entries(previous)) {
      columnTasks.forEach((task, index) => {
        previousLocation.set(task.id, {
          columnKey,
          index,
          ...parseKanbanLocation(columnKey),
        });
      });
    }

    const moves: Array<{
      taskId: string;
      columnKey: string;
      index: number;
      laneKey: string | null;
      statusKey: string;
    }> = [];
    for (const [columnKey, columnTasks] of Object.entries(next)) {
      columnTasks.forEach((task, index) => {
        const prev = previousLocation.get(task.id);
        if (!prev) return;
        if (prev.columnKey !== columnKey || prev.index !== index) {
          moves.push({
            taskId: task.id,
            columnKey,
            index,
            ...parseKanbanLocation(columnKey),
          });
        }
      });
    }

    if (!moves.length) return;

    let completedTaskForFeedback: ProjectTaskType | null = null;
    try {
      for (const move of moves) {
        // Check permissions before allowing the move (double-check in case UI allowed it)
        const task = tasks.find((t) => t.id === move.taskId);
        if (!task) continue;

        const canUpdateThisTaskStatus =
          canUpdateStatusAny || (canUpdateStatusOwn && isOwnTask(task));

        if (!canUpdateThisTaskStatus) {
          console.warn(`Unauthorized status update attempt for task ${task.id}`);
          continue; // Skip this move
        }

        // Skip the synthetic "No Status" column — there's no equivalent on
        // the backend, so we leave the task's status untouched.
        if (groupBy === "assignee") {
          const previousLane = previousLocation.get(move.taskId)?.laneKey;
          if (previousLane !== move.laneKey) {
            toast.error("Assignee swimlanes are view-only for lane changes.");
            kanbanInteractedRef.current = false;
            setLocalAssigneeSwimlaneColumns(previous);
            return;
          }
        }

        if (move.statusKey === NO_STATUS_KEY) continue;

        // The column key IS the status name now (system or custom).
        // Backend `MoveTaskInKanbanDto.status` accepts either the enum value
        // or a custom status name, so we send it directly.
        const nextEpicId =
          groupBy === "epic"
            ? move.laneKey === "no-epic"
              ? null
              : move.laneKey
            : undefined;

        await moveKanbanTask.mutateAsync({
          taskId: move.taskId,
          status: move.statusKey,
          displayOrder: move.index,
          epicId: nextEpicId,
        });

        if (move.statusKey === "DONE") {
          const movedTask = tasks.find((task) => task.id === move.taskId);
          if (movedTask?.estimatedHours && movedTask.status !== "DONE") {
            completedTaskForFeedback = movedTask;
          }
        }
      }
      if (completedTaskForFeedback) {
        setFeedbackTask(completedTaskForFeedback);
      }
    } catch {
      // The hook already surfaces a toast; just roll back the local state.
      kanbanInteractedRef.current = false;
      if (groupBy === "epic") {
        setLocalEpicSwimlaneColumns(previous);
      } else if (groupBy === "assignee") {
        setLocalAssigneeSwimlaneColumns(previous);
      } else {
        setLocalKanbanColumns(previous);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Kanban column management
  // ---------------------------------------------------------------------------
  // Adding/removing a column persists the change on the backend so every user
  // sees the same kanban shape (and tasks can actually be saved to that
  // status). The `useTaskStatuses` hook surfaces toasts and invalidates the
  // status query on success.
  const handleAddColumn = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (statusNameByLower.has(trimmed.toLowerCase())) {
      toast.error("A column with this name already exists.");
      return;
    }
    const nextOrder = orderedStatuses.length
      ? Math.max(...orderedStatuses.map((status) => status.displayOrder)) + 1
      : 0;
    createStatus.mutate({ name: trimmed, displayOrder: nextOrder });
  };

  const handleDeleteColumn = (columnKey: string) => {
    if (columnKey === NO_STATUS_KEY) return;
    const status = orderedStatuses.find((s) => s.name === columnKey);
    if (!status) return;
    if (status.isSystem) {
      toast.error("System statuses can't be removed.");
      return;
    }
    if ((activeKanbanColumns[columnKey] ?? []).length > 0) {
      toast.error("Move all tasks out of this column before deleting it.");
      return;
    }
    deleteStatus.mutate(status.id);
  };

  // List DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <>
      {tasksError ? <Error500 /> : (
        <>
          <ProjectTasksToolbar
            project={project}
            search={search} setSearch={setSearch}
            status={status} setStatus={setStatus}
            priority={priority} setPriority={setPriority}
            type={type} setType={setType}
            assigneeId={assigneeId} setAssigneeId={setAssigneeId}
            milestoneId={milestoneId} setMilestoneId={setMilestoneId}
            epicId={epicId ?? undefined}
            setEpicId={(value) => setEpicId(value)}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            mineOnly={mineOnly}
            onToggleMineOnly={user?.id ? handleToggleMineOnly : undefined}
            onAddTask={canAddTask ? () => handleOpenUploadSheet() : undefined}
            isKanbanFullscreen={isKanbanFullscreen}
            onToggleKanbanFullscreen={handleToggleKanbanFullscreen}
          />

          {tasksAreLoading ? (
            viewMode === "grid" ? (
              <KanbanBoardSkeleton columns={4} cardsPerColumn={3} />
            ) : (
              <TaskListSkeleton rows={6} />
            )
          ) : tasks.length === 0 ? (
            <EmptyState
              message={tTasks("upload.form.labels.noTasks")}
              description={tTasks("upload.form.labels.noTasksHint", {
                defaultValue:
                  "Create your first task to start planning the work for this project.",
              })}
              icon={ListChecks}
              action={
                canAddTask ? (
                  <Button
                    size="sm"
                    onClick={() => setIsAddSheetOpen(true)}
                    className="gap-1"
                  >
                    <Plus className="size-3.5" />
                    {tTasks("addTask", { defaultValue: "Add task" })}
                  </Button>
                ) : null
              }
            />
          ) : viewMode === "grid" ? (
            <TooltipProvider>
              <div
                ref={kanbanFullscreenRef}
                className={
                  isKanbanFullscreen
                    ? "h-full overflow-auto bg-background p-4 md:p-6"
                    : ""
                }
              >
                <ProjectTasksKanbanBoard
                  projectType={project.projectType}
                  groupBy={groupBy}
                  columns={activeKanbanColumns}
                  columnTitles={columnTitles}
                  activeSprint={activeSprintSummary}
                  swimlanes={
                    groupBy === "epic"
                      ? epicSwimlaneModel.lanes
                      : groupBy === "assignee"
                        ? assigneeSwimlaneModel.lanes
                        : undefined
                  }
                  members={project.members}
                  customStatusColorByKey={customStatusColorByKey}
                  customStatusColorByName={customStatusColorByName}
                  totalTasks={tasks.length}
                  canMoveTask={(task) => canUpdateStatusAny || (canUpdateStatusOwn && isOwnTask(task))}
                  canDuplicateTask={(task) => canAddTask}
                  canManageColumns={groupBy === "none" && canManageTaskStatuses}
                  onValueChange={handleKanbanChange}
                  onDragStart={handleKanbanDragStart}
                  onDragEnd={handleKanbanDragEnd}
                  onTaskClick={handleOpenDetailSheet}
                  onDuplicateTask={handleDuplicateTask}
                  onDeleteColumn={handleDeleteColumn}
                  onAddColumn={handleAddColumn}
                />
              </div>
            </TooltipProvider>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(e: DragStartEvent) => setListActiveId(e.active.id as string)}
              onDragEnd={(e: DragEndEvent) => {
                const { active, over } = e;
                if (!over || active.id === over.id) return;
                const oldIndex = tasks.findIndex(t => t.id === active.id);
                const newIndex = tasks.findIndex(t => t.id === over.id);
                if (oldIndex !== -1 && newIndex !== -1) setDisplayedTasks(arrayMove(tasks, oldIndex, newIndex));
                setListActiveId(null);
              }}
              onDragCancel={() => setListActiveId(null)}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={tasks} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 space-y-4">
                  {tasks.map((task) => (
                    <ProjectTaskItem
                      key={task.id}
                      task={task}
                      viewMode="list"
                      projectType={project.projectType}
                      members={project.members}
                      customStatusColorByName={customStatusColorByName}
                      onClick={() => handleOpenDetailSheet(task)}
                      onDuplicate={canAddTask ? (e) => handleDuplicateTask(task, e) : undefined}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {listActiveId ? (
                  <ProjectTaskItem
                    task={tasks.find(t => t.id === listActiveId) as ProjectTaskType}
                    viewMode="list"
                    projectType={project.projectType}
                    members={project.members}
                    customStatusColorByName={customStatusColorByName}
                    isDraggingOverlay
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          <ProjectTaskUploadSheet
            projectId={project.id}
            isAgile={project.projectType === "AGILE"}
            isOpen={isAddSheetOpen}
            onClose={() => { setIsAddSheetOpen(false); setSelectedTask(null); setDuplicateTemplate(null); }}
            task={selectedTask ?? (duplicateTemplate as ProjectTaskType | null)}
          />

          <ProjectTaskDetailSheet
            isOpen={isDetailSheetOpen}
            onClose={() => { setIsDetailSheetOpen(false); setSelectedTask(null); }}
            task={selectedTask}
            onEditClick={() => handleOpenUploadSheet(selectedTask as ProjectTaskType)}
            projectId={project.id}
            canEdit={selectedTask ? (canEditAnyTask || (canEditOwnTask && isOwnTask(selectedTask))) : false}
            canDelete={selectedTask ? (canDeleteAnyTask || (canDeleteOwnTask && isOwnTask(selectedTask))) : false}
          />

          <PredictionFeedbackDialog
            open={!!feedbackTask}
            onOpenChange={(open) => !open && setFeedbackTask(null)}
            taskId={feedbackTask?.id ?? null}
            estimatedHours={feedbackTask?.estimatedHours ?? null}
            taskTitle={feedbackTask?.title}
          />
        </>
      )}
    </>
  );
}
