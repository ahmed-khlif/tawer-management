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
import useMilestoneUpload from "@/modules/projects/hooks/milestones/use-milestone-upload";
import { Milestone } from "@/modules/projects/types/project-milestones";
import { resolveRiskBadgeClass } from "@/modules/projects/utils/badges/project-task-badges";
import {
  createMilestoneSchema,
  CreateMilestoneSchema,
} from "@/modules/projects/validation/milestone.schema";
import { TaskSelector } from "@/modules/projects/components/shared/task-selector";

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
  const { createMilestone, updateMilestone, aiResponse, clearAiResponse } =
    useMilestoneUpload(projectId);
  const isEditing = !!milestone;

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

    let result: Milestone;
    if (isEditing && milestone) {
      result = await updateMilestone.mutateAsync({
        milestoneId: milestone.id,
        data: payload,
      });
    } else {
      result = await createMilestone.mutateAsync(payload);
    }

    const hasAi = !!(
      result?.aiRiskLevel ||
      (result?.aiRecommendations && result.aiRecommendations.length > 0) ||
      result?.aiDueDateSuggestion
    );

    if (!values.aiSuggestDueDate || !hasAi) {
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
                  <FormLabel>Linked Tasks</FormLabel>
                  <FormControl>
                    <TaskSelector
                      projectId={projectId}
                      selectedTaskIds={field.value || []}
                      onChange={field.onChange}
                      placeholder="Link existing tasks to this milestone..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiSuggestDueDate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border bg-muted/40 p-4">
                  <div>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="size-4 text-primary" />
                      Suggest due date &amp; risk
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Use AI to recommend a due date and warn about critical-path or anomaly
                      risks for this milestone.
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
                  AI insights for this milestone
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
                {aiResponse.aiDueDateSuggestion?.suggestedDueDate && (
                  <p>
                    <span className="text-muted-foreground">Suggested due date: </span>
                    {new Date(
                      aiResponse.aiDueDateSuggestion.suggestedDueDate,
                    ).toLocaleDateString()}
                  </p>
                )}
                {aiResponse.aiDueDateSuggestion?.criticalPathWarning && (
                  <p className="text-xs text-muted-foreground">
                    {aiResponse.aiDueDateSuggestion.criticalPathWarning}
                  </p>
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
