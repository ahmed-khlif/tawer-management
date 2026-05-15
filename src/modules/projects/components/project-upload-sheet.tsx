"use client";
import { Sparkles } from "lucide-react";
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectType;
}

export default function ProjectUploadSheet({ isOpen, onClose, project }: Props) {
  const t = useTranslations("modules.projects");
  const isEdit = !!project?.id;

  const { form, isPending, onSubmit, error, aiResponse, clearAiResponse } = useProjectUpload({
    project,
    onSuccess: (response) => {
      form.reset();
      if (!response?.aiInsights && !response?.aiRoadmapRecommendation && !response?.aiSuggestedDurationDays) {
        onClose();
      }
    },
  });

  const handleClose = () => {
    form.reset();
    clearAiResponse();
    onClose();
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
                      initialContent={project?.contents?.[0]?.details || ""}
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

            {/* AI assistance — create-only */}
            {!isEdit && (
              <div className="flex flex-col gap-3 p-4 border rounded-md bg-muted/40">
                <FormField
                  control={form.control}
                  name="aiSuggestRoadmap"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Sparkles className="size-4 text-primary" />
                          {t("upload.form.labels.aiSuggestRoadmap", { defaultValue: "Suggest milestones & epics" })}
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {t("upload.form.hints.aiSuggestRoadmap", {
                            defaultValue:
                              "Use AI to generate an initial roadmap (milestones + epics + duration estimate) at creation time.",
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

            {/* AI response summary after creation */}
            {aiResponse && (aiResponse.aiInsights || aiResponse.aiRoadmapRecommendation || aiResponse.aiSuggestedDurationDays) && (
              <div className="rounded-md border border-primary/40 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  AI suggestions for your new project
                </div>
                {typeof aiResponse.aiSuggestedDurationDays === "number" && (
                  <p className="text-sm">
                    Estimated duration: <span className="font-semibold">{aiResponse.aiSuggestedDurationDays} days</span>
                  </p>
                )}
                {aiResponse.aiRoadmapRecommendation && (
                  <div className="space-y-2 text-sm">
                    {aiResponse.aiRoadmapRecommendation.suggestedMilestones?.length > 0 && (
                      <div>
                        <p className="font-medium">Suggested milestones</p>
                        <ul className="list-disc pl-5 text-muted-foreground">
                          {aiResponse.aiRoadmapRecommendation.suggestedMilestones.map((milestone) => (
                            <li key={milestone}>{milestone}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiResponse.aiRoadmapRecommendation.suggestedEpics?.length > 0 && (
                      <div>
                        <p className="font-medium">Suggested epics</p>
                        <ul className="list-disc pl-5 text-muted-foreground">
                          {aiResponse.aiRoadmapRecommendation.suggestedEpics.map((epic) => (
                            <li key={epic}>{epic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiResponse.aiRoadmapRecommendation.rationale && (
                      <p className="text-xs text-muted-foreground">{aiResponse.aiRoadmapRecommendation.rationale}</p>
                    )}
                  </div>
                )}
                {aiResponse.aiInsights?.recommendations?.length ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Planning recommendations</p>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {aiResponse.aiInsights.recommendations.map((rec) => (
                        <li key={rec}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}

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
