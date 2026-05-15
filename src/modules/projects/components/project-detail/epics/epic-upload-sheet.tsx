"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useEpicUpload from "@/modules/projects/hooks/epics/use-epic-upload";
import useProject from "@/modules/projects/hooks/projects/use-project";
import { Epic } from "@/modules/projects/types/project-epics";
import { resolveRiskBadgeClass } from "@/modules/projects/utils/badges/project-task-badges";
import {
  createEpicSchema,
  CreateEpicSchema,
} from "@/modules/projects/validation/epic.schema";
import { TaskSelector } from "@/modules/projects/components/shared/task-selector";

interface EpicUploadSheetProps {
  projectId: string;
  epic?: Epic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Full ISO string for TimeInput (same storage as project/sprint forms). */
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
  const { createEpic, updateEpic, aiResponse, clearAiResponse } = useEpicUpload(projectId);
  const { project } = useProject(projectId);
  const isEditing = !!epic;

  const form = useForm<CreateEpicSchema>({
    resolver: zodResolver(createEpicSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#2563eb",
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
      startDate: toFormIso(epic?.startDate ?? null),
      endDate: toFormIso(epic?.endDate ?? null),
      aiSuggestTimeline: false,
      taskIds: epic?.tasks?.map((t) => t.id) ?? [],
    });
  }, [epic, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      color: values.color || undefined,
      startDate: toIso(values.startDate),
      endDate: toIso(values.endDate),
      aiSuggestTimeline: values.aiSuggestTimeline,
      taskIds: values.taskIds,
    };

    let result: Epic;
    if (isEditing && epic) {
      result = await updateEpic.mutateAsync({ epicId: epic.id, data: payload });
    } else {
      result = await createEpic.mutateAsync(payload);
    }

    const hasAi = !!(
      result?.aiRiskLevel ||
      (result?.aiRecommendations && result.aiRecommendations.length > 0) ||
      result?.aiTimelineSuggestion
    );

    if (!values.aiSuggestTimeline || !hasAi) {
      onOpenChange(false);
    }
  });

  const handleClose = () => {
    clearAiResponse();
    onOpenChange(false);
  };

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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="What does this epic cover?" {...field} />
                  </FormControl>
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
              emptyPlaceholder="Optional — start date"
              minDate={project?.startTime}
              maxDate={project?.endTime}
            />
            <TimeInput
              inputName="endDate"
              dateLabel="End date"
              timeLabel="Time"
              allowEmpty
              emptyPlaceholder="Optional — end date"
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
                      placeholder="Link existing tasks to this epic..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="aiSuggestTimeline"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border bg-muted/40 p-4">
                  <div>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="size-4 text-primary" />
                      Suggest timeline & risk
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Use AI to detect timeline conflicts, anomaly-based risks, and recommend dates that fit the project window.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {aiResponse && (
              <div className="rounded-md border border-primary/40 bg-primary/5 p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Sparkles className="size-4 text-primary" />
                  AI insights for this epic
                </div>
                {aiResponse.aiRiskLevel && (
                  <div>
                    <span className="text-muted-foreground">Risk level: </span>
                    <Badge
                      variant="outline"
                      className={resolveRiskBadgeClass(aiResponse.aiRiskLevel)}
                    >
                      {aiResponse.aiRiskLevel}
                    </Badge>
                  </div>
                )}
                {aiResponse.aiTimelineSuggestion && (
                  <div className="space-y-1">
                    {aiResponse.aiTimelineSuggestion.suggestedStartDate && (
                      <p>
                        <span className="text-muted-foreground">Suggested start: </span>
                        {new Date(aiResponse.aiTimelineSuggestion.suggestedStartDate).toLocaleDateString()}
                      </p>
                    )}
                    {aiResponse.aiTimelineSuggestion.suggestedEndDate && (
                      <p>
                        <span className="text-muted-foreground">Suggested end: </span>
                        {new Date(aiResponse.aiTimelineSuggestion.suggestedEndDate).toLocaleDateString()}
                      </p>
                    )}
                    {aiResponse.aiTimelineSuggestion.riskNote && (
                      <p className="text-xs text-muted-foreground">{aiResponse.aiTimelineSuggestion.riskNote}</p>
                    )}
                  </div>
                )}
                {aiResponse.aiRecommendations?.length ? (
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {aiResponse.aiRecommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="flex justify-end pt-1">
                  <Button size="sm" variant="outline" type="button" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}

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
