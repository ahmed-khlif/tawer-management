"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import retrieveProjectTasks from "@/modules/projects/services/api/project-tasks";

interface TaskSelectorProps {
  projectId: string;
  selectedTaskIds: string[];
  onChange: (taskIds: string[]) => void;
  placeholder?: string;
  sprintId?: string;
  currentEpicId?: string;
  disabled?: boolean;
}

export function TaskSelector({
  projectId,
  selectedTaskIds,
  onChange,
  placeholder = "Select sprint tasks...",
  sprintId,
  currentEpicId,
  disabled = false,
}: TaskSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["project-tasks-list-selector", projectId, sprintId, currentEpicId],
    queryFn: () =>
      retrieveProjectTasks({
        projectId,
        archived: false,
        limit: 100,
        sprintId,
      }),
    enabled: !!projectId && !disabled,
  });

  const availableTasks = React.useMemo(
    () => tasks.filter((task) => !task.epicId || task.epicId === currentEpicId),
    [tasks, currentEpicId],
  );

  const selectedTasks = availableTasks.filter((task) =>
    selectedTaskIds.includes(task.id),
  );

  const toggleTask = (taskId: string) => {
    const newIds = selectedTaskIds.includes(taskId)
      ? selectedTaskIds.filter((id) => id !== taskId)
      : [...selectedTaskIds, taskId];
    onChange(newIds);
  };

  const removeTask = (taskId: string) => {
    onChange(selectedTaskIds.filter((id) => id !== taskId));
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto w-full justify-between px-3 py-2 font-normal"
            disabled={isLoading || disabled || !sprintId}
          >
            <span className="truncate">
              {selectedTasks.length > 0
                ? `${selectedTasks.length} tasks selected`
                : sprintId
                  ? placeholder
                  : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command className="max-h-[300px]">
            <CommandInput placeholder="Search sprint tasks..." />
            <CommandList>
              <CommandEmpty>
                {sprintId
                  ? "No eligible sprint tasks found."
                  : "No project tasks found."}
              </CommandEmpty>
              <CommandGroup>
                {availableTasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    value={`${task.key} ${task.title}`}
                    onSelect={() => toggleTask(task.id)}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selectedTaskIds.includes(task.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-mono text-muted-foreground">
                        {task.key}
                      </span>
                      <span className="truncate text-sm">{task.title}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTasks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedTasks.map((task) => (
            <Badge
              key={task.id}
              variant="secondary"
              className="rounded-md border-none bg-muted/50 py-1 pl-2 pr-1 text-[11px] font-medium transition-colors hover:bg-muted"
            >
              <span className="mr-1.5 font-mono opacity-60">{task.key}</span>
              <span className="max-w-[150px] truncate">{task.title}</span>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="ml-1 h-3.5 w-3.5 rounded-full p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeTask(task.id);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
