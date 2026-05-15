"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useTaskDependencies from "@/modules/projects/hooks/tasks/use-task-dependencies";
import {
  ProjectTaskDependency,
  ProjectTaskType,
} from "@/modules/projects/types/project-tasks";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";

interface TaskDependenciesSectionProps {
  projectId: string;
  task: ProjectTaskType;
  availableTasks: { id: string; title: string; status: string; key?: string }[];
  permissions: ProjectPermissions;
}

interface DependencyDisplay {
  title: string;
  status: string;
  key?: string;
  shortId: string;
}

function isUuidLike(value: string | undefined | null): boolean {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function getFriendlyTaskTitle(
  title: string | undefined,
  key: string | undefined,
  shortId: string,
): string {
  const safeTitle = typeof title === "string" ? title.trim() : "";
  if (safeTitle && !isUuidLike(safeTitle)) return safeTitle;
  if (key) return `Task ${key}`;
  return `Linked task #${shortId}`;
}

export function TaskDependenciesSection({
  projectId,
  task,
  availableTasks,
  permissions,
}: TaskDependenciesSectionProps) {
  const { addDependency, removeDependency } = useTaskDependencies(projectId, task.id);
  const [pending, setPending] = useState<string>("");

  const dependencies: ProjectTaskDependency[] = task.dependencies ?? [];
  const taskLookup = useMemo(
    () => new Map(availableTasks.map((availableTask) => [availableTask.id, availableTask])),
    [availableTasks],
  );

  const getDependencyDisplay = (dependency: ProjectTaskDependency): DependencyDisplay => {
    const relatedTask =
      taskLookup.get(dependency.blockingTaskId) ??
      (dependency.blockingTask
        ? {
            id: dependency.blockingTaskId,
            title: dependency.blockingTask.title,
            status: dependency.blockingTask.status,
            key: dependency.blockingTask.key,
          }
        : null);

    const key = relatedTask?.key || dependency.blockingTask?.key || undefined;
    const shortId = dependency.blockingTaskId.slice(0, 8);

    return {
      title: getFriendlyTaskTitle(
        relatedTask?.title || dependency.blockingTask?.title,
        key,
        shortId,
      ),
      status: relatedTask?.status || dependency.blockingTask?.status || "",
      key,
      shortId,
    };
  };

  const blockedBy = dependencies.filter((dependency) => {
    const status = getDependencyDisplay(dependency).status;
    return status && status.toUpperCase() !== "DONE";
  });

  const eligibleTasks = availableTasks.filter(
    (availableTask) =>
      availableTask.id !== task.id &&
      !dependencies.some((dependency) => dependency.blockingTaskId === availableTask.id),
  );

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Link2 className="size-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Dependencies</h4>
      </div>

      {blockedBy.length > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 text-destructive" />
          <div className="space-y-2">
            <p className="font-medium text-destructive">
              Blocked by {blockedBy.length} task{blockedBy.length > 1 ? "s" : ""}
            </p>
            <ul className="space-y-1 text-muted-foreground">
              {blockedBy.map((dependency) => {
                const display = getDependencyDisplay(dependency);
                return (
                  <li key={dependency.id} className="flex flex-wrap items-center gap-1.5">
                    {display.key ? (
                      <span className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-foreground/80">
                        {display.key}
                      </span>
                    ) : null}
                    <span>{display.title}</span>
                    <span className="text-xs text-muted-foreground/80">
                      Ref #{display.shortId}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}

      {dependencies.length === 0 ? (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          No dependencies set.
        </p>
      ) : (
        <ul className="space-y-2">
          {dependencies.map((dependency) => {
            const display = getDependencyDisplay(dependency);
            return (
              <li
                key={dependency.id}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card/70 p-3 text-sm shadow-sm"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {display.key ? (
                      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {display.key}
                      </span>
                    ) : null}
                    <p className="min-w-0 truncate font-medium text-foreground">
                      {display.title}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {display.status ? (
                      <span className="capitalize text-muted-foreground">
                        {display.status.toLowerCase().replace(/_/g, " ")}
                      </span>
                    ) : null}
                    <span className="text-muted-foreground/70">Ref #{display.shortId}</span>
                  </div>
                </div>
                {permissions.canRemoveDependency ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-destructive"
                    onClick={() => removeDependency.mutate(dependency.id)}
                    disabled={removeDependency.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {permissions.canAddDependency && eligibleTasks.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <Select value={pending} onValueChange={setPending}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Pick a blocking task" />
            </SelectTrigger>
            <SelectContent>
              {eligibleTasks.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.key ? `${option.key} · ` : ""}
                  {getFriendlyTaskTitle(option.title, option.key, option.id.slice(0, 8))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            disabled={!pending || addDependency.isPending}
            onClick={() => {
              if (!pending) return;
              addDependency.mutate(
                { blockingTaskId: pending },
                { onSuccess: () => setPending("") },
              );
            }}
          >
            Add dependency
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default TaskDependenciesSection;
