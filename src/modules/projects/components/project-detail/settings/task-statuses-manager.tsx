"use client";

import { useState } from "react";
import { ListChecks, Plus, Save, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import useTaskStatuses from "@/modules/projects/hooks/tasks/use-task-statuses";
import {
  CreateTaskStatusPayload,
  ProjectTaskStatus,
} from "@/modules/projects/types/project-tasks";

const DEFAULT_COLOR = "#94a3b8";

interface TaskStatusesManagerProps {
  projectId: string;
}

export function TaskStatusesManager({ projectId }: TaskStatusesManagerProps) {
  const t = useTranslations("modules.projects.project.details");
  const { list, createStatus, updateStatus, deleteStatus } = useTaskStatuses(projectId);
  const [draft, setDraft] = useState<CreateTaskStatusPayload>({
    name: "",
    color: DEFAULT_COLOR,
  });

  const handleAdd = () => {
    if (!draft.name.trim()) return;
    createStatus.mutate(
      { ...draft, name: draft.name.trim() },
      {
        onSuccess: () => setDraft({ name: "", color: DEFAULT_COLOR }),
      },
    );
  };

  const sorted = [...(list.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ListChecks className="size-5" />
          {t("settings.taskStatuses", { defaultValue: "Task statuses" })}
        </CardTitle>
        <CardDescription>
          {t("settings.taskStatusesDescription", {
            defaultValue:
              "Customize the workflow stages tasks move through. Custom statuses appear on the Kanban board alongside the system ones.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {list.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : list.error ? (
          <ErrorBanner
            error={t("settings.taskStatusesLoadError", {
              defaultValue: "Unable to load custom statuses.",
            })}
            onRetry={() => void list.refetch()}
          />
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("settings.noTaskStatuses", {
              defaultValue:
                "No custom statuses yet. Add one below to override the default workflow.",
            })}
          </p>
        ) : (
          <div className="space-y-2">
            {sorted.map((status) => (
              <StatusRow
                key={status.id}
                status={status}
                onSave={(payload) => updateStatus.mutate({ statusId: status.id, payload })}
                onDelete={() => deleteStatus.mutate(status.id)}
                isPending={updateStatus.isPending || deleteStatus.isPending}
              />
            ))}
          </div>
        )}

        <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-[2fr_120px_120px_auto]">
          <div className="space-y-2">
            <Label>{t("settings.statusName", { defaultValue: "Name" })}</Label>
            <Input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="READY_FOR_QA"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("settings.statusColor", { defaultValue: "Color" })}</Label>
            <Input
              type="color"
              value={draft.color || DEFAULT_COLOR}
              onChange={(event) => setDraft((prev) => ({ ...prev, color: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("settings.statusOrder", { defaultValue: "Order" })}</Label>
            <Input
              type="number"
              min={1}
              value={draft.displayOrder ?? ""}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  displayOrder: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} disabled={createStatus.isPending || !draft.name.trim()}>
              <Plus className="mr-2 size-4" />
              {t("settings.addStatus", { defaultValue: "Add" })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusRowProps {
  status: ProjectTaskStatus;
  onSave: (payload: { name?: string; color?: string; displayOrder?: number }) => void;
  onDelete: () => void;
  isPending: boolean;
}

function StatusRow({ status, onSave, onDelete, isPending }: StatusRowProps) {
  const [draft, setDraft] = useState({
    name: status.name,
    color: status.color || DEFAULT_COLOR,
    displayOrder: status.displayOrder,
  });
  const dirty =
    draft.name !== status.name ||
    draft.color !== (status.color || DEFAULT_COLOR) ||
    draft.displayOrder !== status.displayOrder;

  return (
    <div className="grid gap-2 rounded-md border p-3 md:grid-cols-[2fr_120px_120px_auto]">
      <Input
        value={draft.name}
        disabled={status.isSystem}
        onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
      />
      <Input
        type="color"
        value={draft.color}
        onChange={(event) => setDraft((prev) => ({ ...prev, color: event.target.value }))}
      />
      <Input
        type="number"
        min={1}
        value={draft.displayOrder}
        onChange={(event) =>
          setDraft((prev) => ({ ...prev, displayOrder: Number(event.target.value) || 1 }))
        }
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!dirty || isPending}
          onClick={() =>
            onSave({
              name: draft.name,
              color: draft.color,
              displayOrder: draft.displayOrder,
            })
          }
        >
          <Save className="mr-1 size-4" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          disabled={status.isSystem}
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
        {status.isSystem ? <Badge variant="outline">system</Badge> : null}
      </div>
    </div>
  );
}

export default TaskStatusesManager;
