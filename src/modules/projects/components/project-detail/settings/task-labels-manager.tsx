"use client";

import { useState } from "react";
import { Plus, Save, Tag, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
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
import useTaskLabels from "@/modules/projects/hooks/tasks/use-task-labels";
import { ProjectTaskLabel } from "@/modules/projects/types/project-tasks";

interface TaskLabelsManagerProps {
  projectId: string;
}

export function TaskLabelsManager({ projectId }: TaskLabelsManagerProps) {
  const t = useTranslations("modules.projects.project.details");
  const { list, createLabel, updateLabel, deleteLabel } = useTaskLabels(projectId);
  const [draft, setDraft] = useState({ name: "", color: "#0ea5e9" });

  const handleAdd = () => {
    if (!draft.name.trim()) return;
    createLabel.mutate(
      { name: draft.name.trim(), color: draft.color },
      { onSuccess: () => setDraft({ name: "", color: "#0ea5e9" }) },
    );
  };

  const labels = list.data ?? [];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Tag className="size-5" />
          {t("settings.taskLabels", { defaultValue: "Task labels" })}
        </CardTitle>
        <CardDescription>
          {t("settings.taskLabelsDescription", {
            defaultValue:
              "Define a custom set of color-coded labels to tag and group your tasks.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {list.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : list.error ? (
          <ErrorBanner
            error={t("settings.taskLabelsLoadError", {
              defaultValue: "Unable to load labels.",
            })}
            onRetry={() => void list.refetch()}
          />
        ) : labels.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("settings.noTaskLabels", {
              defaultValue: "No labels yet. Add some to organize tasks.",
            })}
          </p>
        ) : (
          <div className="space-y-2">
            {labels.map((label) => (
              <LabelRow
                key={label.id}
                label={label}
                onSave={(payload) => updateLabel.mutate({ labelId: label.id, payload })}
                onDelete={() => deleteLabel.mutate(label.id)}
                isPending={updateLabel.isPending || deleteLabel.isPending}
              />
            ))}
          </div>
        )}

        <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-[2fr_120px_auto]">
          <div className="space-y-2">
            <Label>{t("settings.labelName", { defaultValue: "Name" })}</Label>
            <Input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Frontend"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("settings.labelColor", { defaultValue: "Color" })}</Label>
            <Input
              type="color"
              value={draft.color}
              onChange={(event) => setDraft((prev) => ({ ...prev, color: event.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} disabled={createLabel.isPending}>
              <Plus className="mr-2 size-4" />
              {t("settings.addLabel", { defaultValue: "Add" })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LabelRow({
  label,
  onSave,
  onDelete,
  isPending,
}: {
  label: ProjectTaskLabel;
  onSave: (payload: { name?: string; color?: string | null }) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [draft, setDraft] = useState({
    name: label.name,
    color: label.color ?? "#0ea5e9",
  });
  const dirty = draft.name !== label.name || draft.color !== (label.color ?? "#0ea5e9");

  return (
    <div className="grid gap-2 rounded-md border p-3 md:grid-cols-[2fr_120px_auto]">
      <Input
        value={draft.name}
        onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
      />
      <Input
        type="color"
        value={draft.color}
        onChange={(event) => setDraft((prev) => ({ ...prev, color: event.target.value }))}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!dirty || isPending}
          onClick={() => onSave(draft)}
        >
          <Save className="mr-1 size-4" />
          Save
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default TaskLabelsManager;
