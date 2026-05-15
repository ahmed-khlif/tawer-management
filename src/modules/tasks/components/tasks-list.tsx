import React from "react";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { EnumTaskPriority, FilterTab, TaskType, TaskUpdateType } from "@/modules/tasks/types/tasks";
import type { TaskSort } from "@/modules/tasks/types/filtering";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ListChecks,
  Activity,
  CheckCircle2,
  Loader2,
  BarChart3,
  ArrowUpDown,
} from "lucide-react";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import {
  Toolbar,
  type ToolbarFilterChip,
  type ToolbarTextOverrides,
} from "@/modules/projects/components/shared/toolbar";
import {
  FilterMenu,
  type FilterMenuCategory,
} from "@/modules/projects/components/shared/filter-menu";
import { useTodoStore } from "@/modules/tasks/store/tasks";
import StatusTabs from "@/modules/tasks/components/status-tabs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragCancelEvent,
  DragOverlay
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import usePersonalTasks from "../hooks/tasks/extraction/use-tasks";
import Loading from "@/components/page-loader";
import { useTranslations } from "next-intl";
import { priorityDotColors } from "../utils/enum";
import TaskItem from "./task-item";
import useTasksOrdersUpdates from "../hooks/tasks/use-tasks-orders-updates";
import Error500 from "@/components/error/500";

interface TodoListProps {
  activeTab: FilterTab;
  onSelectTask: (id: string) => void;
  onAddTodoClick: () => void;
}

export default function TaskList({ activeTab, onSelectTask, onAddTodoClick }: TodoListProps) {
  const t = useTranslations("modules.tasks");

  const { updateTasksOrders } = useTasksOrdersUpdates({});
  const { tasks, tasksAreLoading, tasksError, statusState, priorityState, sortByState, setDisplayedTasks, searchState } = usePersonalTasks();

  const [search, setSearch] = searchState;
  const [priority, setPriority] = priorityState;
  const [sortBy, setSortBy] = sortByState;

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const { viewMode, setViewMode, setActiveTab } = useTodoStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleTabChange = (tab: FilterTab) => {
    statusState[1](tab === "all" ? undefined : tab);
    setActiveTab(tab);
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks?.findIndex((item) => item.id === active.id);
    const newIndex = tasks?.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newItems = arrayMove(tasks ?? [], oldIndex as number, newIndex as number);
    updateTasksOrders(newItems.map((task, idx) => ({ id: task.id, displayOrder: idx + 1 })) as (TaskUpdateType & { id: string })[]);
    setDisplayedTasks(newItems);
  };

  const handleDragCancel = (_event: DragCancelEvent) => setActiveId(null);

  const clearPanelFilters = () => {
    setPriority(undefined);
    setSortBy(undefined);
  };

  const sortLabels: Record<TaskSort, string> = {
    statusAsc: t("filters.statusAscending"),
    statusDesc: t("filters.statusDescending"),
    priorityAsc: t("filters.priorityAscending"),
    priorityDesc: t("filters.priorityDescending"),
    dueDateAsc: t("filters.dueDateAscending"),
    dueDateDesc: t("filters.dueDateDescending"),
  };

  const filterCategories: FilterMenuCategory[] = [
    {
      id: "priority",
      label: t("filters.priority"),
      icon: BarChart3,
      multiple: false,
      selectedIds: priority ? [priority] : [],
      onClear: () => setPriority(undefined),
      onToggle: (id) =>
        setPriority(
          priority === (id as EnumTaskPriority)
            ? undefined
            : (id as EnumTaskPriority),
        ),
      options: Object.values(EnumTaskPriority).map((p) => ({
        id: p,
        label: p,
        dotColorClass: priorityDotColors[p],
      })),
    },
    {
      id: "sortBy",
      label: t("filters.sortBy"),
      icon: ArrowUpDown,
      multiple: false,
      selectedIds: sortBy ? [sortBy] : [],
      onClear: () => setSortBy(undefined),
      onToggle: (id) =>
        setSortBy(sortBy === id ? undefined : (id as TaskSort)),
      options: (Object.keys(sortLabels) as TaskSort[]).map((key) => ({
        id: key,
        label: sortLabels[key],
      })),
    },
  ];

  const renderFilterContent = () => <FilterMenu categories={filterCategories} />;

  const taskToolbarText: ToolbarTextOverrides = {
    filtersButton: t("filters.title", { defaultValue: "Filters" }),
    activeFiltersHeading: t("filters.activeHeading", { defaultValue: "Filters" }),
    clearAll: t("filters.clearFilters", { defaultValue: "Clear all" }),
    viewList: t("toolbar.listView", { defaultValue: "List view" }),
    viewGrid: t("toolbar.gridView", { defaultValue: "Grid view" }),
    filterTooltip: t("filters.title", { defaultValue: "Filters" }),
  };

  const activeFilterChips: ToolbarFilterChip[] = React.useMemo(() => {
    const chips: ToolbarFilterChip[] = [];
    if (priority) {
      chips.push({
        id: "priority",
        prefix: `${t("filters.priority")}:`,
        label: priority,
        onRemove: () => setPriority(undefined),
      });
    }
    if (sortBy) {
      chips.push({
        id: "sortBy",
        prefix: `${t("filters.sortBy")}:`,
        label: sortLabels[sortBy] ?? sortBy,
        onRemove: () => setSortBy(undefined),
      });
    }
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priority, sortBy, t]);

  const personalTasks = (tasks ?? []).filter((t) => !t.parentTaskId);

  const counts = React.useMemo(() => {
    const list = tasks ?? [];
    return {
      total: list.length,
      pending: list.filter((task) => task.status === "Pending").length,
      inProgress: list.filter((task) => task.status === "InProgress").length,
      completed: list.filter((task) => task.status === "Completed").length,
    };
  }, [tasks]);

  const dndContent = (
    <SortableContext items={personalTasks} strategy={rectSortingStrategy}>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personalTasks.map((task) => (
            <TaskItem key={task.id} task={task} onClick={() => onSelectTask(task.id)} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 space-y-4">
          {personalTasks.map((task) => (
            <TaskItem key={task.id} task={task} onClick={() => onSelectTask(task.id)} viewMode="list" />
          ))}
        </div>
      )}
    </SortableContext>
  );

  return (
    <>
      {tasksError ? (
        <Error500 />
      ) : (
        <>
          <PageHeaderStrip
            icon={ListChecks}
            title={t("tabs.personal", { defaultValue: "Personal Tasks" })}
            description={t("subtitle", {
              defaultValue:
                "Capture your personal to-dos, set priorities and stay focused.",
            })}
            metrics={[
              {
                icon: Activity,
                value: counts.total,
                label: t("metrics.total", { defaultValue: "total" }),
              },
              counts.inProgress > 0
                ? {
                    icon: Loader2,
                    value: counts.inProgress,
                    label: t("metrics.inProgress", {
                      defaultValue: "in progress",
                    }),
                    tone: "running",
                  }
                : false,
              counts.completed > 0
                ? {
                    icon: CheckCircle2,
                    value: counts.completed,
                    label: t("metrics.completed", { defaultValue: "completed" }),
                    tone: "success",
                  }
                : false,
            ]}
            actions={
              <Button size="sm" onClick={onAddTodoClick} className="gap-1.5">
                <Plus className="size-4" />
                {t("addTask")}
              </Button>
            }
          />

          <Toolbar
            tabs={
              <StatusTabs activeTab={activeTab} onTabChange={handleTabChange} />
            }
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t("upload.form.placeholders.search")}
            filterContent={renderFilterContent()}
            activeFilterCount={(priority ? 1 : 0) + (sortBy ? 1 : 0)}
            activeFilters={activeFilterChips}
            onClearAllFilters={
              priority || sortBy ? clearPanelFilters : undefined
            }
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            textOverrides={taskToolbarText}
            sticky={false}
            className="mb-2 rounded-xl border bg-card/40 px-3 py-2 shadow-sm sm:px-4"
          />

          {tasksAreLoading ? (
            <Loading />
          ) : personalTasks.length === 0 ? (
            <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">{t("upload.form.labels.noTasks")}</h3>
            </div>
          ) : viewMode === "grid" ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter}
              onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
              {dndContent}
              <DragOverlay>
                {activeId ? <TaskItem task={tasks?.find((t) => t.id === activeId) as TaskType} viewMode="grid" isDraggingOverlay /> : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter}
              onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}
              modifiers={[restrictToVerticalAxis]}>
              {dndContent}
              <DragOverlay>
                {activeId ? <TaskItem task={tasks?.find((t) => t.id === activeId) as TaskType} viewMode="list" isDraggingOverlay /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </>
      )}
    </>
  );
}
