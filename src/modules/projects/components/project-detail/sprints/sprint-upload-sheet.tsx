"use client";
import { Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import TextEditor from "@/components/ui/text-editor";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { Badge } from "@/components/ui/badge";
import { SprintType } from "@/modules/projects/types/project-sprints";
import TimeInput from "@/components/time-input";
import useSprintUpload from "@/modules/projects/hooks/sprints/use-sprint-upload";
import SprintAiCapacity from "./sprint-ai-capacity";
import { resolveRiskBadgeClass } from "@/modules/projects/utils/badges/project-task-badges";

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

  const { form, isPending, onSubmit, error, aiResponse, clearAiResponse } = useSprintUpload({
    projectId,
    sprint,
    onSuccess: (response) => {
      form.reset();
      if (!response?.aiCapacitySignal && !response?.aiPlanningRecommendation) {
        onClose();
      }
    },
  });

  const handleClose = () => { form.reset(); clearAiResponse(); onClose(); };

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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.description")}</FormLabel>
                  <FormControl>
                    <TextEditor
                      initialContent={sprint?.description || ""}
                      placeholder={t("upload.form.placeholders.description")}
                      {...field}
                    />
                  </FormControl>
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

            {/* AI assistance — create-only */}
            {!isEdit && (
              <div className="flex flex-col gap-3 p-4 border rounded-md bg-muted/40">
                <FormField
                  control={form.control}
                  name="aiSuggestCapacity"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Sparkles className="size-4 text-primary" />
                          {t("upload.form.labels.aiSuggestCapacity", { defaultValue: "Suggest capacity signal" })}
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {t("upload.form.hints.aiSuggestCapacity", {
                            defaultValue:
                              "Compute utilization vs commitment and surface risk-aware recommendations after creation.",
                          })}
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aiSuggestPlanning"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between border-t pt-3">
                      <div>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Sparkles className="size-4 text-primary" />
                          {t("upload.form.labels.aiSuggestPlanning", { defaultValue: "Suggest sprint plan" })}
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {t("upload.form.hints.aiSuggestPlanning", {
                            defaultValue:
                              "Use AI to propose which backlog tasks to include or exclude based on capacity.",
                          })}
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {error !== "" && <ErrorBanner error={error} />}

            {/* Live capacity signal preview (edit mode) */}
            {isEdit && sprint?.id ? (
              <SprintAiCapacity projectId={projectId} sprintId={sprint.id} />
            ) : null}

            {/* AI response after creation */}
            {aiResponse && (aiResponse.aiCapacitySignal || aiResponse.aiPlanningRecommendation) && (
              <div className="rounded-md border border-primary/40 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  AI suggestions for the new sprint
                </div>
                {aiResponse.aiCapacitySignal && (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={resolveRiskBadgeClass(
                          aiResponse.aiCapacitySignal.riskLevel,
                        )}
                      >
                        {aiResponse.aiCapacitySignal.riskLevel}
                      </Badge>
                      <span className="text-muted-foreground">
                        Utilization {aiResponse.aiCapacitySignal.utilizationPercent}%
                      </span>
                    </div>
                    {aiResponse.aiCapacitySignal.recommendations?.length ? (
                      <ul className="list-disc pl-5 text-muted-foreground">
                        {aiResponse.aiCapacitySignal.recommendations.map((rec) => (
                          <li key={rec}>{rec}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
                {aiResponse.aiPlanningRecommendation && (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Planning suggestion</p>
                    {aiResponse.aiPlanningRecommendation.includeTaskIds?.length ? (
                      <p className="text-muted-foreground">
                        Include {aiResponse.aiPlanningRecommendation.includeTaskIds.length} task(s)
                      </p>
                    ) : null}
                    {aiResponse.aiPlanningRecommendation.excludeTaskIds?.length ? (
                      <p className="text-muted-foreground">
                        Exclude {aiResponse.aiPlanningRecommendation.excludeTaskIds.length} task(s)
                      </p>
                    ) : null}
                    {aiResponse.aiPlanningRecommendation.rationale && (
                      <p className="text-xs text-muted-foreground">
                        {aiResponse.aiPlanningRecommendation.rationale}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" type="button" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}

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
