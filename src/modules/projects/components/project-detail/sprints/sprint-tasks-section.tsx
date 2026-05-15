"use client";

import { ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSprintTasks } from "@/modules/projects/hooks/sprints/use-sprint-tasks";

interface SprintTasksSectionProps {
  projectId: string;
  sprintId: string;
}

export function SprintTasksSection({ projectId, sprintId }: SprintTasksSectionProps) {
  const { data: tasks, isLoading } = useSprintTasks(projectId, sprintId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ListTodo className="size-4" /> Tasks in sprint ({tasks?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !tasks || tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks assigned to this sprint.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <span className="truncate font-medium">{task.title}</span>
                <div className="flex items-center gap-2">
                  {task.labels?.slice(0, 3).map((label) => (
                    <Badge
                      key={label.id}
                      variant="outline"
                      style={label.color ? { borderColor: label.color, color: label.color } : undefined}
                      className="text-[10px]"
                    >
                      {label.name}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="capitalize">
                    {task.status.toLowerCase().replace(/_/g, " ")}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default SprintTasksSection;
