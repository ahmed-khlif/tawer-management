"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LayoutList, Activity, ListChecks, CheckSquare } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useProjectBacklog from "@/modules/projects/hooks/tasks/use-project-backlog";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { ProjectType } from "@/modules/projects/types/projects";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import BacklogTaskRow from "./backlog-task-row";
import TasksBulkActionBar from "./tasks-bulk-action-bar";
import { EmptyState } from "../../shared/empty-state";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import { Toolbar } from "../../shared/toolbar";
import ProjectTaskItem from "../project-task/project-task-item";

interface ProjectBacklogProps {
  project: ProjectType;
  permissions: ProjectPermissions;
}

export function ProjectBacklog({ project, permissions }: ProjectBacklogProps) {
  const isAgile = project.projectType === "AGILE";
  const { backlog, reorder, moveToSprint } = useProjectBacklog(project.id);
  const { sprints } = useProjectSprints(project.id, { enabled: isAgile });
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (backlog.data) {
      setOrderedIds(backlog.data.map((task) => task.id));
    }
  }, [backlog.data]);

  const tasksById = useMemo(
    () =>
      new Map<string, ProjectTaskType>(
        (backlog.data ?? []).map((t) => [t.id, t]),
      ),
    [backlog.data],
  );
  const orderedTasks = useMemo(
    () =>
      orderedIds
        .map((id) => tasksById.get(id))
        .filter((task): task is ProjectTaskType => Boolean(task)),
    [orderedIds, tasksById],
  );

  const sprintOptions = useMemo(
    () =>
      (sprints ?? [])
        .filter((s) => s.status !== "Completed")
        .map((s) => ({ id: s.id, name: s.name })),
    [sprints],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (!permissions.canManageBacklog) return;

    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(next);
    reorder.mutate({
      tasks: next.map((taskId, index) => ({ taskId, displayOrder: index })),
    });
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selected.size === orderedTasks.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orderedTasks.map((t) => t.id)));
    }
  };

  const totalTasks = orderedTasks.length;
  const allSelected =
    selected.size > 0 && selected.size === orderedTasks.length;

  const headerStrip = (
    <PageHeaderStrip
      icon={LayoutList}
      title="Backlog"
      description="Tasks without a sprint or with status BACKLOG show up here. Drag to reorder, or move them to a sprint when you're ready."
      metrics={[
        { icon: Activity, value: totalTasks, label: "tasks" },
        selected.size > 0
          ? {
              icon: CheckSquare,
              value: selected.size,
              label: "selected",
              tone: "primary",
            }
          : false,
      ]}
      actions={
        totalTasks > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="gap-1.5"
          >
            <ListChecks className="size-3.5" />
            {allSelected ? "Clear selection" : "Select all"}
          </Button>
        ) : null
      }
    />
  );

  if (backlog.isLoading) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (backlog.error) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <ErrorBanner
          error="Unable to load backlog."
          onRetry={() => void backlog.refetch()}
        />
      </div>
    );
  }

  if (orderedTasks.length === 0) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <EmptyState
          icon={LayoutList}
          message="Backlog is empty"
          description="Tasks without a sprint or with status BACKLOG appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {headerStrip}

      <Toolbar
        search=""
        onSearchChange={() => {}}
        searchPlaceholder="Backlog search is handled from task filters"
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          if (mode === "list" || mode === "grid") setViewMode(mode);
        }}
        className="rounded-xl border border-border/70 bg-card/90 px-3 py-2 shadow-sm sm:px-4"
        sticky={false}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedIds}
          strategy={verticalListSortingStrategy}
        >
          {viewMode === "grid" ? (
            <div className="rounded-2xl border border-border/70 bg-card/40 p-3 shadow-sm sm:p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {orderedTasks.map((task) => (
                  <ProjectTaskItem
                    key={task.id}
                    task={task}
                    viewMode="grid"
                    projectType={project.projectType}
                    members={project.members}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {orderedTasks.map((task) => (
                <BacklogTaskRow
                  key={task.id}
                  task={task}
                  selected={selected.has(task.id)}
                  onSelect={handleSelect}
                  onMoveToSprint={(taskId, sprintId) =>
                    moveToSprint.mutate({ taskId, payload: { sprintId } })
                  }
                  sprints={sprintOptions}
                  canMove={permissions.canMoveTaskToSprint}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      <TasksBulkActionBar
        project={project}
        selectedIds={Array.from(selected)}
        onClear={() => setSelected(new Set())}
        permissions={permissions}
      />
    </div>
  );
}

export default ProjectBacklog;
