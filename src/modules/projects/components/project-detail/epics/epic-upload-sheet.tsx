"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TimeInput from "@/components/time-input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import useEpicUpload from "@/modules/projects/hooks/epics/use-epic-upload";
import useProject from "@/modules/projects/hooks/projects/use-project";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import { Epic } from "@/modules/projects/types/project-epics";
import {
  createEpicSchema,
  CreateEpicSchema,
} from "@/modules/projects/validation/epic.schema";
import { TaskSelector } from "@/modules/projects/components/shared/task-selector";
import PmAiDescriptionAssist from "@/modules/projects/components/shared/pm-ai-description-assist";
import { previewEpicAi } from "@/modules/projects/services/api/project-ai-preview";
import { PmAiAssistPanel, PmAiSuggestionCard } from "@/modules/projects/components/shared/pm-ai-assist";
import type { EpicAiPreviewResult } from "@/modules/projects/types/project-ai-preview";

interface EpicUploadSheetProps {
  projectId: string;
  epic?: Epic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toFormIso = (value?: string | null) =>
  value ? new Date(value).toISOString() : "";

function toIso(value?: string): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export default function EpicUploadSheet({
  projectId,
  epic,
  open,
  onOpenChange,
}: EpicUploadSheetProps) {
  const { createEpic, updateEpic, clearAiResponse } = useEpicUpload(projectId);
  const { project } = useProject(projectId);
  const { sprints } = useProjectSprints(projectId, { enabled: open });
  const isEditing = !!epic;
  const [preview, setPreview] = React.useState<EpicAiPreviewResult | null>(null);

  const form = useForm<CreateEpicSchema>({
    resolver: zodResolver(createEpicSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#2563eb",
      sprintId: "",
      startDate: "",
      endDate: "",
      aiSuggestTimeline: false,
      taskIds: [],
    },
  });

  useEffect(() => {
    form.reset({
      name: epic?.name ?? "",
      description: epic?.description ?? "",
      color: epic?.color ?? "#2563eb",
      sprintId: epic?.sprintId ?? "",
      startDate: toFormIso(epic?.startDate ?? null),
      endDate: toFormIso(epic?.endDate ?? null),
      aiSuggestTimeline: false,
      taskIds: epic?.tasks?.map((t) => t.id) ?? [],
    });
  }, [epic, form]);

  const watchedName = form.watch("name");
  const watchedDescription = form.watch("description");
  const watchedColor = form.watch("color");
  const watchedSprintId = form.watch("sprintId");
  const watchedStartDate = form.watch("startDate");
  const watchedEndDate = form.watch("endDate");
  const watchedTaskIds = form.watch("taskIds");
  const canSuggestTimeline = !!watchedName?.trim() && !!watchedSprintId;

  const lastSprintIdRef = React.useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!open) return;
    if (lastSprintIdRef.current === undefined) {
      lastSprintIdRef.current = watchedSprintId || undefined;
      return;
    }

    if (lastSprintIdRef.current !== (watchedSprintId || undefined)) {
      form.setValue("taskIds", [], { shouldDirty: true });
      lastSprintIdRef.current = watchedSprintId || undefined;
    }
  }, [watchedSprintId, open, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      color: values.color || undefined,
      sprintId: values.sprintId,
      startDate: toIso(values.startDate),
      endDate: toIso(values.endDate),
      aiSuggestTimeline: values.aiSuggestTimeline,
      taskIds: values.taskIds,
    };

    if (isEditing && epic) {
      await updateEpic.mutateAsync({ epicId: epic.id, data: payload });
    } else {
      await createEpic.mutateAsync(payload);
    }

    onOpenChange(false);
  });

  const handleClose = () => {
    clearAiResponse();
    setPreview(null);
    onOpenChange(false);
  };

  const previewMutation = useMutation({
    mutationFn: () =>
      previewEpicAi(projectId, {
        name: watchedName.trim(),
        description: watchedDescription || undefined,
        color: watchedColor || undefined,
        startDate: watchedStartDate || undefined,
        endDate: watchedEndDate || undefined,
        sprintId: watchedSprintId,
        taskIds: watchedTaskIds?.length ? watchedTaskIds : undefined,
      }),
    onSuccess: (response) => setPreview(response),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit epic" : "Create epic"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Authentication overhaul" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sprintId"
              render={({ field }) => {
                const activeSprintId = sprints.find(
                  (sprint) => sprint.status === "Running",
                )?.id;

                return (
                  <FormItem>
                    <FormLabel>Sprint</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose the sprint that owns this epic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sprints.map((sprint) => (
                          <SelectItem key={sprint.id} value={sprint.id}>
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate font-medium">
                                {sprint.name}
                                {sprint.id === activeSprintId ? " • Active" : ""}
                              </span>
                              <span className="truncate text-xs text-muted-foreground">
                                {sprint.startDate.toLocaleDateString()} -{" "}
                                {sprint.endDate.toLocaleDateString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="What does this epic cover?" {...field} />
                  </FormControl>
                  <PmAiDescriptionAssist
                    entityType="EPIC"
                    projectId={projectId}
                    title={form.watch("name")}
                    description={field.value}
                    onApply={(value) =>
                      form.setValue("description", value, { shouldDirty: true })
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} value={field.value || "#2563eb"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TimeInput
              inputName="startDate"
              dateLabel="Start date"
              timeLabel="Time"
              allowEmpty
              emptyPlaceholder="Optional - start date"
              minDate={project?.startTime}
              maxDate={project?.endTime}
            />
            <TimeInput
              inputName="endDate"
              dateLabel="End date"
              timeLabel="Time"
              allowEmpty
              emptyPlaceholder="Optional - end date"
              minDate={project?.startTime}
              maxDate={project?.endTime}
            />

            <FormField
              control={form.control}
              name="taskIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Tasks</FormLabel>
                  <FormControl>
                    <TaskSelector
                      projectId={projectId}
                      selectedTaskIds={field.value || []}
                      onChange={field.onChange}
                      sprintId={watchedSprintId || undefined}
                      currentEpicId={epic?.id}
                      disabled={!watchedSprintId}
                      placeholder="Link tasks from this sprint..."
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Only tasks from the selected sprint can be linked to this epic.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PmAiAssistPanel
              title="AI Epic Assist"
              description="Use AI to shape epic dates that better fit the selected sprint window."
              actions={[
                {
                  id: "epic-timeline",
                  label: "Suggest timeline",
                  onClick: () => previewMutation.mutate(),
                  disabled: !canSuggestTimeline,
                  hint: "Choose a sprint and add an epic name first.",
                  loading: previewMutation.isPending,
                  priority: !watchedEndDate,
                },
              ]}
            >
              {preview ? (
                <PmAiSuggestionCard
                  title="Timeline suggestion"
                  badge={preview.aiRiskLevel}
                  onDismiss={() => setPreview(null)}
                  footer={
                    <>
                      {preview.aiTimelineSuggestion?.suggestedStartDate ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            form.setValue(
                              "startDate",
                              preview.aiTimelineSuggestion?.suggestedStartDate || "",
                              { shouldDirty: true },
                            )
                          }
                        >
                          Apply start
                        </Button>
                      ) : null}
                      {preview.aiTimelineSuggestion?.suggestedEndDate ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            form.setValue(
                              "startDate",
                              preview.aiTimelineSuggestion?.suggestedStartDate || "",
                              { shouldDirty: true },
                            );
                            form.setValue(
                              "endDate",
                              preview.aiTimelineSuggestion?.suggestedEndDate || "",
                              { shouldDirty: true },
                            );
                          }}
                        >
                          Apply timeline
                        </Button>
                      ) : null}
                    </>
                  }
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    {preview.aiTimelineSuggestion?.suggestedStartDate ? (
                      <p className="text-xs text-muted-foreground">
                        Suggested start:{" "}
                        <span className="font-medium text-foreground">
                          {new Date(
                            preview.aiTimelineSuggestion.suggestedStartDate,
                          ).toLocaleString()}
                        </span>
                      </p>
                    ) : null}
                    {preview.aiTimelineSuggestion?.suggestedEndDate ? (
                      <p className="text-xs text-muted-foreground">
                        Suggested end:{" "}
                        <span className="font-medium text-foreground">
                          {new Date(
                            preview.aiTimelineSuggestion.suggestedEndDate,
                          ).toLocaleString()}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  {preview.aiTimelineSuggestion?.riskNote ? (
                    <p className="text-xs text-muted-foreground">
                      {preview.aiTimelineSuggestion.riskNote}
                    </p>
                  ) : null}
                  {preview.aiRecommendations?.length ? (
                    <ul className="list-disc pl-4 text-xs text-muted-foreground">
                      {preview.aiRecommendations.map((rec) => (
                        <li key={rec}>{rec}</li>
                      ))}
                    </ul>
                  ) : null}
                </PmAiSuggestionCard>
              ) : null}
            </PmAiAssistPanel>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEpic.isPending || updateEpic.isPending}
              >
                {isEditing ? "Save changes" : "Create epic"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
