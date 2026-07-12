"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import TextEditor from "@/components/ui/text-editor";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { SprintType } from "@/modules/projects/types/project-sprints";
import TimeInput from "@/components/time-input";
import useSprintUpload from "@/modules/projects/hooks/sprints/use-sprint-upload";
import SprintAiCapacity from "./sprint-ai-capacity";
import { previewSprintAi } from "@/modules/projects/services/api/project-ai-preview";
import { PmAiAssistPanel, PmAiSuggestionCard } from "@/modules/projects/components/shared/pm-ai-assist";
import PmAiDescriptionAssist from "@/modules/projects/components/shared/pm-ai-description-assist";
import type { SprintAiPreviewResult } from "@/modules/projects/types/project-ai-preview";

interface Props {
  projectId: string;
  projectStartDate: Date;
  projectEndDate: Date;
  isOpen: boolean;
  onClose: () => void;
  sprint?: SprintType | null;
}

export default function SprintUploadSheet({ projectId, projectStartDate, projectEndDate, isOpen, onClose, sprint }: Props) {
  const t = useTranslations("modules.projects.sprints");
  const isEdit = !!sprint?.id;
  const [preview, setPreview] = React.useState<SprintAiPreviewResult | null>(null);

  const { form, isPending, onSubmit, error, clearAiResponse } = useSprintUpload({
    projectId,
    sprint,
    onSuccess: () => {
      form.reset();
      setPreview(null);
      onClose();
    },
  });

  const handleClose = () => { form.reset(); clearAiResponse(); setPreview(null); onClose(); };

  const watchedName = form.watch("name");
  const watchedDescription = form.watch("description");
  const watchedStartDate = form.watch("startDate");
  const watchedEndDate = form.watch("endDate");
  const watchedEstimatedStartDate = form.watch("estimatedStartDate");
  const watchedEstimatedEndDate = form.watch("estimatedEndDate");
  const watchedCapacity = form.watch("capacity");
  const canPreviewSprintAi = !!watchedName?.trim() && !!watchedStartDate && !!watchedEndDate;

  const previewMutation = useMutation({
    mutationFn: () =>
      previewSprintAi(projectId, {
        name: watchedName.trim(),
        description: watchedDescription || undefined,
        startDate: watchedStartDate,
        endDate: watchedEndDate,
        estimatedStartDate: watchedEstimatedStartDate || undefined,
        estimatedEndDate: watchedEstimatedEndDate || undefined,
        capacity: typeof watchedCapacity === "number" ? watchedCapacity : undefined,
      }),
    onSuccess: (response) => setPreview(response),
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? t("upload.updateTitle") : t("upload.createTitle")}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 pt-2">

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.name")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field: { value, onChange, name, ...field } }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.description")}</FormLabel>
                  <FormControl>
                    <TextEditor
                      initialContent={sprint?.description || ""}
                      value={typeof value === "string" ? value : ""}
                      placeholder={t("upload.form.placeholders.description")}
                      onChange={onChange}
                      name={name}
                      {...field}
                    />
                  </FormControl>
                  <PmAiDescriptionAssist
                    entityType="SPRINT"
                    projectId={projectId}
                    title={form.watch("name")}
                    description={typeof value === "string" ? value : ""}
                    onApply={(value) => form.setValue("description", value, { shouldDirty: true })}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language select — keeping for later
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.labels.language", { defaultValue: "Language" })}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                const hidePending = isEdit && sprint?.status !== "Pending";
                return (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.status")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!hidePending && <SelectItem value="Pending">{t("status.pending")}</SelectItem>}
                        <SelectItem value="Running">{t("status.running")}</SelectItem>
                        <SelectItem value="Stopped">{t("status.stopped")}</SelectItem>
                        <SelectItem value="Completed">{t("status.completed")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <TimeInput inputName="startDate" dateLabel={t("upload.form.labels.startDate")} timeLabel={t("upload.form.labels.startTime")} minDate={projectStartDate} maxDate={projectEndDate} />
            <TimeInput inputName="endDate" dateLabel={t("upload.form.labels.endDate")} timeLabel={t("upload.form.labels.endTime")} minDate={projectStartDate} maxDate={projectEndDate} />
            <TimeInput inputName="estimatedStartDate" dateLabel={t("upload.form.labels.estimatedStartDate")} timeLabel={t("upload.form.labels.estimatedStartTime")} minDate={projectStartDate} maxDate={projectEndDate} />
            <TimeInput inputName="estimatedEndDate" dateLabel={t("upload.form.labels.estimatedEndDate")} timeLabel={t("upload.form.labels.estimatedEndTime")} minDate={projectStartDate} maxDate={projectEndDate} />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("upload.form.labels.capacity", { defaultValue: "Story-point capacity (optional)" })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="e.g. 30"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PmAiAssistPanel
              title="AI Sprint Assist"
              description="Check sprint capacity, suggest a sprint plan, and generate an estimated delivery window before you save."
              actions={[
                {
                  id: "estimated-dates",
                  label: "Suggest estimated dates",
                  onClick: () => previewMutation.mutate(),
                  disabled: !canPreviewSprintAi,
                  hint: "Add sprint name and dates first.",
                  loading: previewMutation.isPending,
                  priority: !watchedEstimatedStartDate || !watchedEstimatedEndDate,
                },
                {
                  id: "capacity",
                  label: "Check capacity",
                  onClick: () => previewMutation.mutate(),
                  disabled: !canPreviewSprintAi,
                  hint: "Add sprint name and dates first.",
                  loading: previewMutation.isPending,
                  priority: typeof watchedCapacity !== "number" || watchedCapacity <= 0,
                },
                {
                  id: "planning",
                  label: "Suggest sprint plan",
                  onClick: () => previewMutation.mutate(),
                  disabled: !canPreviewSprintAi,
                  hint: "Add sprint name and dates first.",
                  loading: previewMutation.isPending,
                },
              ]}
            >
              {preview ? (
                <PmAiSuggestionCard
                  title="Sprint AI preview"
                  badge={preview.aiCapacitySignal?.riskLevel}
                  onDismiss={() => setPreview(null)}
                  footer={
                    <>
                        {preview.suggestedEstimatedStartDate ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                          onClick={() => {
                              form.setValue("estimatedStartDate", preview.suggestedEstimatedStartDate || "", { shouldDirty: true });
                              form.setValue("estimatedEndDate", preview.suggestedEstimatedEndDate || "", { shouldDirty: true });
                            }}
                          >
                          Use AI estimated dates
                          </Button>
                        ) : null}
                      </>
                    }
                  >
                  {preview.suggestedEstimatedStartDate &&
                  preview.suggestedEstimatedEndDate ? (
                    <div className="rounded-lg border bg-muted/10 p-3 text-sm">
                      <p className="font-medium">Suggested estimated window</p>
                      <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                        <p>Start: {preview.suggestedEstimatedStartDate}</p>
                        <p>End: {preview.suggestedEstimatedEndDate}</p>
                      </div>
                    </div>
                  ) : null}
                  {preview.aiCapacitySignal ? (
                    <div className="rounded-lg border bg-muted/10 p-3 text-sm">
                      <p className="font-medium">
                        Capacity {preview.aiCapacitySignal.committedStoryPoints}/{preview.aiCapacitySignal.sprintCapacity || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Utilization {preview.aiCapacitySignal.utilizationPercent}% · {preview.aiCapacitySignal.riskLevel} risk
                      </p>
                      {preview.aiCapacitySignal.recommendations?.length ? (
                        <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                          {preview.aiCapacitySignal.recommendations.map((rec, index) => (
                            <li key={`${rec}-${index}`}>{rec}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                  {preview.aiPlanningRecommendation ? (
                    <div className="rounded-lg border bg-muted/10 p-3 text-sm">
                      <p className="font-medium">Planning recommendation</p>
                      <p className="text-xs text-muted-foreground">{preview.aiPlanningRecommendation.rationale}</p>
                      <div className="mt-2 grid gap-2 md:grid-cols-2 text-xs text-muted-foreground">
                        <p>Include: {preview.aiPlanningRecommendation.includeTaskIds.length}</p>
                        <p>Exclude: {preview.aiPlanningRecommendation.excludeTaskIds.length}</p>
                      </div>
                    </div>
                  ) : null}
                </PmAiSuggestionCard>
              ) : null}
            </PmAiAssistPanel>

            {error !== "" && <ErrorBanner error={error} />}

            {/* Live capacity signal preview (edit mode) */}
            {isEdit && sprint?.id ? (
              <SprintAiCapacity projectId={projectId} sprintId={sprint.id} />
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleClose} variant="secondary" disabled={isPending} type="button">
                {t("upload.form.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEdit ? t("upload.form.updating") : t("upload.form.creating")
                  : isEdit ? t("upload.form.update") : t("upload.form.create")}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
