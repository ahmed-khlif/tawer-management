"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { businessUnitNamed } from "@/modules/projects/utils/badges/project-badges";
import { ProjectType } from "@/modules/projects/types/projects";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import TextEditor from "@/components/ui/text-editor";
import TimeInput from "@/components/time-input";
import useProjectUpload from "@/modules/projects/hooks/projects/use-project-upload";
import UserSearchCombobox from "./project-detail/members/user-search-combobox";
import { previewProjectRoadmap } from "@/modules/projects/services/api/project-ai-preview";
import { PmAiAssistPanel, PmAiSuggestionCard } from "@/modules/projects/components/shared/pm-ai-assist";
import PmAiDescriptionAssist from "@/modules/projects/components/shared/pm-ai-description-assist";
import type { ProjectRoadmapPreviewResult } from "@/modules/projects/types/project-ai-preview";
import type { ProjectTemplatePreset } from "@/modules/projects/types/project-template-presets";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectType;
  templatePreset?: ProjectTemplatePreset | null;
}

export default function ProjectUploadSheet({ isOpen, onClose, project, templatePreset }: Props) {
  const t = useTranslations("modules.projects");
  const isEdit = !!project?.id;
  const [roadmapPreview, setRoadmapPreview] = React.useState<ProjectRoadmapPreviewResult | null>(null);
  const [roadmapPinned, setRoadmapPinned] = React.useState(false);

  const { form, isPending, onSubmit, error, clearAiResponse } = useProjectUpload({
    project,
    templatePreset,
    onSuccess: () => {
      form.reset();
      setRoadmapPreview(null);
      setRoadmapPinned(false);
      clearAiResponse();
      onClose();
    },
  });

  const roadmapPreviewMutation = useMutation({
    mutationFn: previewProjectRoadmap,
    onSuccess: (response) => {
      setRoadmapPreview(response);
      setRoadmapPinned(false);
    },
  });

  const handleClose = () => {
    form.reset();
    clearAiResponse();
    setRoadmapPreview(null);
    setRoadmapPinned(false);
    onClose();
  };

  const watchedName = form.watch("name");
  const watchedDescription = form.watch("description");
  const watchedProjectType = form.watch("projectType");
  const watchedBusinessUnit = form.watch("businessUnit");
  const watchedStartDate = form.watch("startDate");
  const watchedEndDate = form.watch("endDate");
  const watchedEstimatedStartDate = form.watch("estimatedStartDate");
  const watchedEstimatedEndDate = form.watch("estimatedEndDate");
  const canSuggestRoadmap =
    !!watchedName?.trim() &&
    !!watchedProjectType &&
    !!watchedBusinessUnit &&
    !!watchedStartDate &&
    !!watchedEndDate;

  const handleRoadmapPreview = () => {
    if (!canSuggestRoadmap) return;
    roadmapPreviewMutation.mutate({
      name: watchedName.trim(),
      description: watchedDescription || undefined,
      projectType: watchedProjectType,
      businessUnit: watchedBusinessUnit!,
      startDate: watchedStartDate,
      endDate: watchedEndDate,
      estimatedStartDate: watchedEstimatedStartDate || undefined,
      estimatedEndDate: watchedEstimatedEndDate || undefined,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEdit
              ? t("upload.updateProject.title", { defaultValue: "Update Project" })
              : t("upload.createProject.title", { defaultValue: "Create Project" })}
          </SheetTitle>
        </SheetHeader>

        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 pt-2">
            {!isEdit && templatePreset ? (
              <div className="rounded-xl border bg-primary/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                        Template selected
                      </Badge>
                      <Badge variant="outline">{templatePreset.category}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{templatePreset.title}</p>
                      <p className="text-xs text-muted-foreground">{templatePreset.description}</p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="gap-1.5">
                    <Link href="/dashboard/project-templates">
                      <ArrowLeftRight className="size-3.5" />
                      Change template
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Name + Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.name", { defaultValue: "Name" })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("upload.form.placeholders.name", { defaultValue: "Project name..." })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.displayOrder", { defaultValue: "Display Order" })}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.description", { defaultValue: "Description" })}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("upload.form.placeholders.description", { defaultValue: "Describe the project..." })} {...field} />
                  </FormControl>
                  <PmAiDescriptionAssist
                    entityType="PROJECT"
                    title={form.watch("name")}
                    description={field.value}
                    onApply={(value) => form.setValue("description", value, { shouldDirty: true })}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Details */}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.details", { defaultValue: "Details" })}</FormLabel>
                  <FormControl>
                    <TextEditor
                      initialContent={field.value || ""}
                      placeholder={t("upload.form.placeholders.details", { defaultValue: "Add detailed project information..." })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.language", { defaultValue: "Language" })}</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select language..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">{t("upload.form.languageOptions.english")}</SelectItem>
                      <SelectItem value="French">{t("upload.form.languageOptions.french")}</SelectItem>
                      <SelectItem value="Arabic">{t("upload.form.languageOptions.arabic")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <TimeInput inputName="startDate" dateLabel={t("upload.form.labels.startDate", { defaultValue: "Start Date" })} timeLabel={t("upload.form.labels.startTime", { defaultValue: "Start Time" })} />
            <TimeInput inputName="endDate" dateLabel={t("upload.form.labels.endDate", { defaultValue: "End Date" })} timeLabel={t("upload.form.labels.endTime", { defaultValue: "End Time" })} />
            <TimeInput inputName="estimatedStartDate" dateLabel={t("upload.form.labels.estimatedStartDate", { defaultValue: "Estimated Start Date" })} timeLabel={t("upload.form.labels.estimatedStartTime", { defaultValue: "Estimated Start Time" })} />
            <TimeInput inputName="estimatedEndDate" dateLabel={t("upload.form.labels.estimatedEndDate", { defaultValue: "Estimated End Date" })} timeLabel={t("upload.form.labels.estimatedEndTime", { defaultValue: "Estimated End Time" })} />

            {/* Status / Type / BU */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.status")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder={t("upload.form.placeholders.status")} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">{t("project.status.pending")}</SelectItem>
                        <SelectItem value="Running">{t("project.status.running")}</SelectItem>
                        <SelectItem value="Stopped">{t("project.status.stopped")}</SelectItem>
                        <SelectItem value="Completed">{t("project.status.completed")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("list.filters.projectType", { defaultValue: "Project Type" })}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AGILE">{t("project.projectType.agile")}</SelectItem>
                        <SelectItem value="FREESTYLE">{t("project.projectType.freestyle")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("list.filters.businessUnit", { defaultValue: "Business Unit" })}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder={t("upload.form.placeholders.businessUnit")} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TawerDev">{businessUnitNamed.TawerDev}</SelectItem>
                        <SelectItem value="TawerCreative">{businessUnitNamed.TawerCreative}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Manager — only shown on create */}
            {!isEdit && (
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.manager", { defaultValue: "Project Manager" })}</FormLabel>
                    <FormControl>
                      <UserSearchCombobox
                        value={field.value || ""}
                        onChange={(userId) => field.onChange(userId)}
                        placeholder={t("upload.form.placeholders.manager", {
                          defaultValue: "Search and select a project manager...",
                        })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <PmAiAssistPanel
              title={isEdit ? "AI Project Planning" : "AI Project Kickoff"}
              description="Use AI to shape a better roadmap once the project basics are in place."
              actions={[
                {
                  id: "roadmap",
                  label: "Suggest roadmap",
                  onClick: handleRoadmapPreview,
                  disabled: !canSuggestRoadmap,
                  hint: "Add a project name, type, business unit, and dates first.",
                  loading: roadmapPreviewMutation.isPending,
                  priority: !watchedEstimatedEndDate,
                },
              ]}
            >
              {roadmapPreview ? (
                <PmAiSuggestionCard
                  title="Roadmap preview"
                  badge={`${roadmapPreview.aiSuggestedDurationDays} days`}
                  onDismiss={() => {
                    setRoadmapPreview(null);
                    setRoadmapPinned(false);
                  }}
                  footer={
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          form.setValue("estimatedStartDate", roadmapPreview.suggestedEstimatedStartDate, { shouldDirty: true });
                          form.setValue("estimatedEndDate", roadmapPreview.suggestedEstimatedEndDate, { shouldDirty: true });
                        }}
                      >
                        Apply dates
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setRoadmapPinned(true)}
                      >
                        Keep roadmap
                      </Button>
                    </>
                  }
                >
                  {roadmapPinned ? (
                    <p className="text-xs text-primary">Roadmap pinned to this draft while you continue editing.</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {roadmapPreview.aiRoadmapRecommendation.rationale}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested milestones</p>
                      <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                        {roadmapPreview.aiRoadmapRecommendation.suggestedMilestones.map((milestone) => (
                          <li key={milestone}>{milestone}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested epics</p>
                      <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                        {roadmapPreview.aiRoadmapRecommendation.suggestedEpics.map((epic) => (
                          <li key={epic}>{epic}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </PmAiSuggestionCard>
              ) : null}
            </PmAiAssistPanel>

            {/* Paid / Archived toggles */}
            <div className="flex flex-col gap-3 p-4 border rounded-md bg-muted/40">
              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div>
                      <FormLabel className="text-sm font-medium">{t("upload.form.labels.paid", { defaultValue: "Paid Project" })}</FormLabel>
                      <p className="text-xs text-muted-foreground">{t("upload.form.hints.paid", { defaultValue: "This project is a paid engagement" })}</p>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {isEdit && (
                <FormField
                  control={form.control}
                  name="isArchived"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between border-t pt-3">
                      <div>
                        <FormLabel className="text-sm font-medium">{t("upload.form.labels.isArchived", { defaultValue: "Archived" })}</FormLabel>
                        <p className="text-xs text-muted-foreground">{t("upload.form.hints.isArchived", { defaultValue: "Hide this project from the active list" })}</p>
                      </div>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {error !== "" && <ErrorBanner error={error} />}

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleClose} variant="secondary" disabled={isPending} type="button">
                {t("upload.form.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t("upload.form.creating", { defaultValue: "Saving..." })
                  : isEdit
                    ? t("upload.form.updateProject", { defaultValue: "Update Project" })
                    : t("upload.form.createProject", { defaultValue: "Create Project" })}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
