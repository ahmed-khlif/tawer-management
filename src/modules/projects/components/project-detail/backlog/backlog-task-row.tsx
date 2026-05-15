"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoveRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { cn } from "@/lib/utils";
import {
  projectTaskPriorityClasses,
  projectTaskTypeClasses,
} from "@/modules/projects/utils/badges/project-task-badges";

interface BacklogTaskRowProps {
  task: ProjectTaskType;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onMoveToSprint?: (taskId: string, sprintId: string) => void;
  sprints: Array<{ id: string; name: string }>;
  canMove: boolean;
}

export function BacklogTaskRow({
  task,
  selected,
  onSelect,
  onMoveToSprint,
  sprints,
  canMove,
}: BacklogTaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border bg-background p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag handle"
      >
        <GripVertical className="size-4" />
      </button>
      <Checkbox
        checked={selected}
        onCheckedChange={(value) => onSelect(task.id, value === true)}
        onClick={(event) => event.stopPropagation()}
      />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{task.key}</span>
          <p className="text-sm font-medium">{task.title}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              task.type
                ? projectTaskTypeClasses[task.type.toUpperCase()]
                : undefined,
            )}
          >
            {task.type?.toLowerCase()}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              task.priority
                ? projectTaskPriorityClasses[task.priority.toUpperCase()]
                : undefined,
            )}
          >
            {task.priority?.toLowerCase()}
          </Badge>
          {task.storyPoints != null ? (
            <Badge variant="outline" className="pm-badge-points border">
              {task.storyPoints} pts
            </Badge>
          ) : null}
          {task.dueDate ? <span>Due {new Date(task.dueDate).toLocaleDateString()}</span> : null}
        </div>
      </div>
      {canMove && sprints.length > 0 && onMoveToSprint ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoveRight className="mr-2 size-4" />
              Move to sprint
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sprints.map((sprint) => (
              <DropdownMenuItem
                key={sprint.id}
                onClick={() => onMoveToSprint(task.id, sprint.id)}
              >
                {sprint.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

export default BacklogTaskRow;
