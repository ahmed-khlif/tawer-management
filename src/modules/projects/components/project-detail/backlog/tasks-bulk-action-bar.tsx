"use client";

import { CheckSquare, ListTodo, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useTaskBulkUpdate from "@/modules/projects/hooks/tasks/use-task-bulk-update";
import useTaskStatuses from "@/modules/projects/hooks/tasks/use-task-statuses";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { ProjectType } from "@/modules/projects/types/projects";
import { EnumProjectTaskStatus } from "@/modules/projects/types/project-tasks";

interface TasksBulkActionBarProps {
  project: ProjectType;
  selectedIds: string[];
  onClear: () => void;
  permissions: ProjectPermissions;
  onBulkDelete?: (ids: string[]) => void;
  extraActions?: React.ReactNode;
}

export function TasksBulkActionBar({
  project,
  selectedIds,
  onClear,
  permissions,
  onBulkDelete,
  extraActions,
}: TasksBulkActionBarProps) {
  const { bulkStatus } = useTaskBulkUpdate(project.id);
  const customStatuses = useTaskStatuses(project.id);

  if (selectedIds.length === 0) return null;

  const customList = customStatuses.list.data ?? [];
  const fallbackStatuses = Object.values(EnumProjectTaskStatus);

  const setStatus = (statusValue: string) => {
    bulkStatus.mutate({
      tasks: selectedIds.map((taskId) => ({ taskId, status: statusValue })),
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CheckSquare className="size-4" />
        {selectedIds.length} selected
      </div>

      {permissions.canBulkUpdateStatus ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={bulkStatus.isPending}>
              <ListTodo className="mr-2 size-4" />
              Set status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {customList.length > 0
              ? customList.map((status) => (
                  <DropdownMenuItem
                    key={status.id}
                    onClick={() => setStatus(status.name)}
                  >
                    <span
                      className="mr-2 size-2 rounded-full"
                      style={{ backgroundColor: status.color ?? "#94a3b8" }}
                    />
                    {status.name}
                  </DropdownMenuItem>
                ))
              : fallbackStatuses.map((status) => (
                  <DropdownMenuItem key={status} onClick={() => setStatus(status)}>
                    {status.replace(/_/g, " ")}
                  </DropdownMenuItem>
                ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {extraActions}

      {onBulkDelete && (permissions.canDeleteAnyTask || permissions.canDeleteOwnTask) ? (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => onBulkDelete(selectedIds)}
        >
          <Trash2 className="mr-2 size-4" />
          Delete
        </Button>
      ) : null}

      <Button variant="ghost" size="icon" className="size-8" onClick={onClear}>
        <X className="size-4" />
      </Button>
    </div>
  );
}

export default TasksBulkActionBar;
