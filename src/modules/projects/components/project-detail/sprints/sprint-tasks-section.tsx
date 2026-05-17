"use client";

import * as React from "react";
import { ChevronDown, Layers, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import useProjectTasks from "@/modules/projects/hooks/tasks/use-project-tasks";
import { SprintType } from "@/modules/projects/types/project-sprints";
import ProjectTaskItem from "../project-task/project-task-item";
import { EmptyState } from "../../shared/empty-state";

interface SprintTasksSectionProps {
  projectId: string;
  sprint: SprintType;
}

export function SprintTasksSection({
  projectId,
  sprint,
}: SprintTasksSectionProps) {
  const { tasks, tasksAreLoading } = useProjectTasks(projectId, {
    initialFilters: { sprintId: sprint.id },
  });
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    {},
  );

  React.useEffect(() => {
    setOpenSections((current) => {
      const next = { ...current };
      for (const epic of sprint.epicBreakdown ?? []) {
        if (!(epic.id in next)) {
          next[epic.id] = true;
        }
      }
      if (!("standalone" in next)) {
        next.standalone = true;
      }
      return next;
    });
  }, [sprint.epicBreakdown]);

  const tasksByEpic = React.useMemo(() => {
    const grouped = new Map<string, typeof tasks>();
    for (const task of tasks) {
      const key = task.epic?.id ?? "standalone";
      const bucket = grouped.get(key) ?? [];
      bucket.push(task);
      grouped.set(key, bucket);
    }
    return grouped;
  }, [tasks]);

  const standaloneTasks = tasksByEpic.get("standalone") ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ListTodo className="size-4" /> Tasks in sprint ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasksAreLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            message="No tasks assigned to this sprint."
            description="Add tasks to this sprint to see the epic breakdown here."
          />
        ) : (
          <div className="space-y-3">
            {(sprint.epicBreakdown ?? []).map((epic) => {
              const epicTasks = tasksByEpic.get(epic.id) ?? [];
              const isOpen = openSections[epic.id] ?? true;

              return (
                <Collapsible
                  key={epic.id}
                  open={isOpen}
                  onOpenChange={(open) =>
                    setOpenSections((current) => ({ ...current, [epic.id]: open }))
                  }
                >
                  <div
                    className="overflow-hidden rounded-xl border border-border/70 bg-card/70"
                    style={{
                      borderLeftColor: epic.color ?? "#6366F1",
                      borderLeftWidth: 4,
                    }}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between gap-3 px-4 py-3 text-left">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <Layers className="size-4 text-muted-foreground" />
                            <span className="truncate text-sm font-semibold">
                              {epic.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>
                              {epic.completedTaskCount}/{epic.taskCount} tasks complete
                            </span>
                            <div className="w-32">
                              <Progress value={epic.progress} className="h-1.5" />
                            </div>
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-3 border-t border-border/60 px-3 py-3">
                        {epicTasks.length > 0 ? (
                          epicTasks.map((task) => (
                            <ProjectTaskItem
                              key={task.id}
                              task={task}
                              viewMode="list"
                              projectType="AGILE"
                            />
                          ))
                        ) : (
                          <p className="px-2 text-sm text-muted-foreground">
                            No tasks currently mapped to this epic in the sprint.
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}

            <Collapsible
              open={openSections.standalone ?? true}
              onOpenChange={(open) =>
                setOpenSections((current) => ({ ...current, standalone: open }))
              }
            >
              <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between gap-3 px-4 py-3 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ListTodo className="size-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">Standalone Tasks</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {standaloneTasks.length} task
                        {standaloneTasks.length === 1 ? "" : "s"} without an epic
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        (openSections.standalone ?? true) && "rotate-180",
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 border-t border-border/60 px-3 py-3">
                    {standaloneTasks.length > 0 ? (
                      standaloneTasks.map((task) => (
                        <ProjectTaskItem
                          key={task.id}
                          task={task}
                          viewMode="list"
                          projectType="AGILE"
                        />
                      ))
                    ) : (
                      <p className="px-2 text-sm text-muted-foreground">
                        No standalone tasks in this sprint.
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SprintTasksSection;
