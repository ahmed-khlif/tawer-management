"use client";

import { Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useTaskLabels from "@/modules/projects/hooks/tasks/use-task-labels";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";

interface TaskLabelsSectionProps {
  projectId: string;
  task: ProjectTaskType;
  permissions: ProjectPermissions;
}

export function TaskLabelsSection({ projectId, task, permissions }: TaskLabelsSectionProps) {
  const { list, assignLabel, removeLabel } = useTaskLabels(projectId);
  const taskLabels = task.labels ?? [];
  const taskLabelIds = new Set(taskLabels.map((label) => label.id));
  const availableLabels = (list.data ?? []).filter((label) => !taskLabelIds.has(label.id));

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Labels</h4>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {taskLabels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No labels assigned.</p>
        ) : (
          taskLabels.map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              style={label.color ? { borderColor: label.color, color: label.color } : undefined}
              className="gap-1"
            >
              {label.name}
              {permissions.canAssignLabel ? (
                <button
                  type="button"
                  onClick={() => removeLabel.mutate({ taskId: task.id, labelId: label.id })}
                  className="-mr-1 ml-1 hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </Badge>
          ))
        )}

        {permissions.canAssignLabel && availableLabels.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                + Add label
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableLabels.map((label) => (
                <DropdownMenuItem
                  key={label.id}
                  onClick={() => assignLabel.mutate({ taskId: task.id, labelId: label.id })}
                >
                  <span
                    className="mr-2 size-2 rounded-full"
                    style={{ backgroundColor: label.color ?? "#94a3b8" }}
                  />
                  {label.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}

export default TaskLabelsSection;
