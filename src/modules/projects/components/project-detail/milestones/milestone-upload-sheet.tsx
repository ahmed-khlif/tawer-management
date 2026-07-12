"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TimeInput from "@/components/time-input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import useMilestoneUpload from "@/modules/projects/hooks/milestones/use-milestone-upload";
import { Milestone } from "@/modules/projects/types/project-milestones";
import {
  createMilestoneSchema,
  CreateMilestoneSchema,
} from "@/modules/projects/validation/milestone.schema";
import { TaskSelector } from "@/modules/projects/components/shared/task-selector";
import PmAiDescriptionAssist from "@/modules/projects/components/shared/pm-ai-description-assist";
import { previewMilestoneAi } from "@/modules/projects/services/api/project-ai-preview";
import { PmAiAssistPanel, PmAiSuggestionCard } from "@/modules/projects/components/shared/pm-ai-assist";
import type { MilestoneAiPreviewResult } from "@/modules/projects/types/project-ai-preview";

interface MilestoneUploadSheetProps {
  projectId: string;
  milestone?: Milestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Full ISO string for TimeInput (aligned with project/sprint forms). */
const toFormIso = (value?: string | null) =>
  value ? new Date(value).toISOString() : "";

function toIso(value?: string): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export default function MilestoneUploadSheet({
  projectId,
  milestone,
  open,
  onOpenChange,
}: MilestoneUploadSheetProps) {
  const { createMilestone, updateMilestone, clearAiResponse } =
    useMilestoneUpload(projectId);
  const isEditing = !!milestone;
  const [preview, setPreview] = React.useState<MilestoneAiPreviewResult | null>(null);

  const form = useForm<CreateMilestoneSchema>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      name: "",
      description: "",
      dueDate: "",
      aiSuggestDueDate: false,
      taskIds: [],
    },
  });

  useEffect(() => {
    form.reset({
      name: milestone?.name ?? "",
      description: milestone?.description ?? "",
      dueDate: toFormIso(milestone?.dueDate ?? null),
      aiSuggestDueDate: false,
      taskIds: milestone?.tasks?.map((t) => t.id) ?? [],
    });
  }, [milestone, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      dueDate: toIso(values.dueDate),
      aiSuggestDueDate: values.aiSuggestDueDate,
      taskIds: values.taskIds,
    };

    if (isEditing && milestone) {
      await updateMilestone.mutateAsync({
        milestoneId: milestone.id,
        data: payload,
      });
    } else {
      await createMilestone.mutateAsync(payload);
    }

    onOpenChange(false);
  });

  const handleClose = () => {
    clearAiResponse();
    setPreview(null);
    onOpenChange(false);
  };

  const watchedName = form.watch("name");
  const watchedDescription = form.watch("description");
  const watchedDueDate = form.watch("dueDate");
  const watchedTaskIds = form.watch("taskIds");
  const canSuggestDueDate = !!watchedName?.trim();

  const previewMutation = useMutation({
    mutationFn: () =>
      previewMilestoneAi(projectId, {
        name: watchedName.trim(),
        description: watchedDescription || undefined,
        dueDate: watchedDueDate || undefined,
        taskIds: watchedTaskIds?.length ? watchedTaskIds : undefined,
      }),
    onSuccess: (response) => setPreview(response),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit milestone" : "Create milestone"}</SheetTitle>
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
                    <Input placeholder="Q3 launch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="What should be delivered?" {...field} />
                  </FormControl>
                  <PmAiDescriptionAssist
                    entityType="MILESTONE"
                    projectId={projectId}
                    title={form.watch("name")}
                    description={field.value}
                    onApply={(value) => form.setValue("description", value, { shouldDirty: true })}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <TimeInput
              inputName="dueDate"
              dateLabel="Due date"
              timeLabel="Time"
              allowEmpty
              emptyPlaceholder="Optional — due date"
            />

            <FormField
              control={form.control}
              name="taskIds"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel>Linked Tasks</FormLabel>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {(field.value || []).length} linked
                    </Badge>
                  </div>
                  <FormControl>
                    <TaskSelector
                      projectId={projectId}
                      selectedTaskIds={field.value || []}
                      onChange={field.onChange}
                      placeholder="Link existing tasks to this milestone..."
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Link the tasks that define this checkpoint so milestone progress and overdue signals stay accurate.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PmAiAssistPanel
              title="AI Milestone Assist"
              description="Get a due-date recommendation once the milestone has enough context."
              actions={[
                {
                  id: "milestone-due-date",
                  label: "Suggest due date",
                  onClick: () => previewMutation.mutate(),
                  disabled: !canSuggestDueDate,
                  hint: "Add a milestone name first.",
                  loading: previewMutation.isPending,
                  priority: !watchedDueDate,
                },
              ]}
            >
              {preview ? (
                <PmAiSuggestionCard
                  title="Due date suggestion"
                  badge={preview.aiRiskLevel}
                  onDismiss={() => setPreview(null)}
                  footer={
                    preview.aiDueDateSuggestion?.suggestedDueDate ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          form.setValue("dueDate", preview.aiDueDateSuggestion?.suggestedDueDate || "", {
                            shouldDirty: true,
                          })
                        }
                      >
                        Apply due date
                      </Button>
                    ) : undefined
                  }
                >
                  {preview.aiDueDateSuggestion?.suggestedDueDate ? (
                    <p className="text-sm font-medium">
                      {new Date(preview.aiDueDateSuggestion.suggestedDueDate).toLocaleString()}
                    </p>
                  ) : null}
                  {preview.aiDueDateSuggestion?.criticalPathWarning ? (
                    <p className="text-xs text-muted-foreground">
                      {preview.aiDueDateSuggestion.criticalPathWarning}
                    </p>
                  ) : null}
                  {preview.aiRecommendations?.length ? (
                    <ul className="list-disc pl-4 text-xs text-muted-foreground">
                      {preview.aiRecommendations.map((rec, index) => (
                        <li key={`${rec}-${index}`}>{rec}</li>
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
                disabled={createMilestone.isPending || updateMilestone.isPending}
              >
                {isEditing ? "Save changes" : "Create milestone"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
