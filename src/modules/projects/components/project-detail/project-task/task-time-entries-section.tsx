"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Clock3, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import useTaskTimeEntries from "@/modules/projects/hooks/tasks/use-task-time-entries";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { ProjectTaskType, ProjectTaskTimeEntry } from "@/modules/projects/types/project-tasks";

interface TaskTimeEntriesSectionProps {
  projectId: string;
  taskId: string;
  task: ProjectTaskType;
  permissions: ProjectPermissions;
}

export function TaskTimeEntriesSection({
  projectId,
  taskId,
  task,
  permissions,
}: TaskTimeEntriesSectionProps) {
  const { list, logEntry, updateEntry, deleteEntry } = useTaskTimeEntries(projectId, taskId);
  const [draft, setDraft] = useState({ hours: "1", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState({ hours: "0", description: "" });

  const handleSubmit = () => {
    const hours = Number(draft.hours);
    if (!Number.isFinite(hours) || hours <= 0) return;
    logEntry.mutate(
      {
        hours,
        description: draft.description || undefined,
      },
      {
        onSuccess: () => setDraft({ hours: "1", description: "" }),
      },
    );
  };

  const startEditing = (entry: ProjectTaskTimeEntry) => {
    setEditingId(entry.id);
    setEditingDraft({
      hours: String(entry.hours ?? 0),
      description: entry.description ?? "",
    });
  };

  const saveEditing = () => {
    if (!editingId) return;
    const hours = Number(editingDraft.hours);
    if (!Number.isFinite(hours) || hours <= 0) return;
    updateEntry.mutate(
      {
        timeEntryId: editingId,
        payload: {
          hours,
          description: editingDraft.description || undefined,
        },
      },
      {
        onSuccess: () => setEditingId(null),
      },
    );
  };

  const entries = list.data ?? [];

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Clock3 className="size-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Time entries</h4>
      </div>

      {list.isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : entries.length === 0 ? (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">No time logged yet.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => {
            const isEditing = editingId === entry.id;
            const isOwn = permissions.isOwnTimeEntry(entry);
            const canEdit =
              permissions.canUpdateAnyTimeEntry ||
              (permissions.canUpdateOwnTimeEntry && isOwn);
            const canDelete =
              permissions.canDeleteAnyTimeEntry ||
              (permissions.canDeleteOwnTimeEntry && isOwn);

            if (isEditing) {
              return (
                <li
                  key={entry.id}
                  className="grid gap-2 rounded-md border p-3 text-sm md:grid-cols-[100px_1fr_auto]"
                >
                  <Input
                    type="number"
                    min="0"
                    step="0.25"
                    value={editingDraft.hours}
                    onChange={(event) =>
                      setEditingDraft((prev) => ({ ...prev, hours: event.target.value }))
                    }
                  />
                  <Textarea
                    rows={1}
                    value={editingDraft.description}
                    onChange={(event) =>
                      setEditingDraft((prev) => ({ ...prev, description: event.target.value }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={saveEditing} disabled={updateEntry.isPending}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {entry.hours}h
                    {entry.userName ? (
                      <span className="text-muted-foreground"> · {entry.userName}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  {entry.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{entry.description}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  {canEdit ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => startEditing(entry)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => deleteEntry.mutate(entry.id)}
                      disabled={deleteEntry.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {permissions.canLogTime && permissions.isOwnTask(task) ? (
        <div className="grid gap-2 rounded-md border p-3 md:grid-cols-[100px_1fr_auto]">
          <div>
            <Label className="text-xs">Hours</Label>
            <Input
              type="number"
              min="0"
              step="0.25"
              value={draft.hours}
              onChange={(event) => setDraft((prev) => ({ ...prev, hours: event.target.value }))}
            />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              rows={1}
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSubmit} disabled={logEntry.isPending}>
              Log
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default TaskTimeEntriesSection;
