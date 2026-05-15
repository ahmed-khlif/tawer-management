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
}

export function TaskSelector({
  projectId,
  selectedTaskIds,
  onChange,
  placeholder = "Select tasks...",
}: TaskSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["project-tasks-list-selector", projectId],
    queryFn: () => retrieveProjectTasks({ projectId, archived: false, limit: 100 }),
    enabled: !!projectId,
  });

  const selectedTasks = tasks.filter((task) => selectedTaskIds.includes(task.id));

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
            className="w-full justify-between h-auto py-2 px-3 font-normal"
            disabled={isLoading}
          >
            <span className="truncate">
              {selectedTasks.length > 0 
                ? `${selectedTasks.length} tasks selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command className="max-h-[300px]">
            <CommandInput placeholder="Search tasks..." />
            <CommandList>
              <CommandEmpty>No tasks found.</CommandEmpty>
              <CommandGroup>
                {tasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    value={`${task.key} ${task.title}`}
                    onSelect={() => toggleTask(task.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedTaskIds.includes(task.id)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-mono text-muted-foreground">{task.key}</span>
                      <span className="text-sm truncate">{task.title}</span>
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
            <Badge key={task.id} variant="secondary" className="pl-2 pr-1 py-1 rounded-md text-[11px] font-medium border-none bg-muted/50 hover:bg-muted transition-colors">
              <span className="mr-1.5 font-mono opacity-60">{task.key}</span>
              <span className="truncate max-w-[150px]">{task.title}</span>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-3.5 w-3.5 ml-1 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
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
