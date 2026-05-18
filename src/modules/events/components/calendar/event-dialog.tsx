"use client";;
import { useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { RiDeleteBinLine } from "@remixicon/react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import type { CalendarEventType, EventColor } from ".";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEventStore } from "../../store/events";
import useEventUpload from "../../hooks/event-actions/use-event-upload";
import UsersExtractionInput from "@/modules/users/components/users-extraction-input";
import { ErrorBanner } from "@/components/error-banner";
import getEventTailwindColor from "../../utils/event-colors";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import TimeInput from "@/components/time-input";
import { retrieveAllProjects } from "@/modules/projects/services";

interface EventDialogProps {
  event: CalendarEventType | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (eventId: string) => void;
}

export function EventDialog({ event, isOpen, onClose, onDelete }: EventDialogProps) {
  const t = useTranslations("modules.events.upload");

  const eventType = useEventStore((store) => store.eventType);
  const { user } = useCurrentUser();
  const userHasDeletionPermession = eventType === "personalEvent" ? true : user ? hasPermissions(user.roles, eventType === "meeting" ? "meetingsManagement" : "eventsManagement", "delete") || event?.createdById === user.id : false;
  const userHasEditionPermission = eventType === "personalEvent" ? true : user ? hasPermissions(user.roles, eventType === "meeting" ? "meetingsManagement" : "eventsManagement", "edit") || event?.createdById === user.id : false;

  const { onSubmit, form, isPending, error } = useEventUpload({
    event,
    type: eventType || "personalEvent",
    onSuccess: onClose
  });
  const projectsQuery = useQuery({
    queryKey: ["event-project-options"],
    queryFn: async () => {
      return retrieveAllProjects({
        isArchived: false,
        sortBy: "createdAtDesc",
      });
    },
    enabled: isOpen && eventType !== "personalEvent",
    staleTime: 5 * 60 * 1000,
  });

  const watchAllUsers = form.watch("allUsers");

  useEffect(() => {
    if (isOpen) {
      if (event) {
        form.reset({
          title: event.title,
          description: event.description || "",
          location: event.location || "",
          startTime: event.startDate.toISOString(),
          endTime: event.endDate?.toISOString(),
          projectId: event.projectId || "none",
          color: (event.color as any) || "sky",
          allUsers: event.toAllUsers || false,
          participantsId: event.participantsIds // Map your existing participants here if available
        });
      } else {
        const startTime = new Date();
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 1);

        form.reset({
          title: "",
          description: "",
          location: "",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          projectId: "none",
          color: "sky",
          allUsers: false,
          participantsId: []
        });
      }
    }
  }, [event, isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/70 bg-card/98 sm:max-w-[520px]">
        <DialogHeader className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.07] via-background to-transparent p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10">
              <CalendarDays className="size-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>{event?.id ? t("dialog.title.edit") : t("dialog.title.create")}</DialogTitle>
                <Badge variant="outline" className="border-primary/15 bg-background/80 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {eventType === "personalEvent" ? "Personal" : eventType}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Plan timing, participants, and project context in the same PM-friendly flow.
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
              <div className="mb-4 space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Event brief</h3>
                <p className="text-xs text-muted-foreground">
                  Start with the event name and a short summary your team can understand at a glance.
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dialog.fields.title")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Textarea
                          rows={4}
                          placeholder="Add the agenda, purpose, or follow-up context for this event."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dialog.fields.location")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-background to-transparent p-4 shadow-sm">
              <div className="mb-4 space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Scheduling and audience</h3>
                <p className="text-xs text-muted-foreground">
                  Choose timing, visibility, and participants so the event lands in the right PM context.
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="allUsers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-xl border border-border/70 bg-background/90 p-3 shadow-sm">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("dialog.fields.allUsers")}</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Enable this when the update should appear for everyone in scope.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {!watchAllUsers && eventType !== "personalEvent" && (
                  <UsersExtractionInput
                    inputName="participantsId"
                    label={t("dialog.fields.participants")}
                  />
                )}

                {eventType !== "personalEvent" ? (
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project context</FormLabel>
                        <Select
                          value={field.value || "none"}
                          onValueChange={(value) =>
                            field.onChange(value === "none" ? "" : value)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a project (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No linked project</SelectItem>
                            {(projectsQuery.data ?? []).map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Link this meeting or event to a project so it appears in the PM calendar too.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <div className="space-y-4">
                  <TimeInput inputName="startTime" dateLabel={t("dialog.fields.startDate")} timeLabel={t("dialog.fields.startTime")} />
                  <TimeInput inputName="endTime" dateLabel={t("dialog.fields.endDate")} timeLabel={t("dialog.fields.endTime")} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
              <div className="mb-4 space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Visual signal</h3>
                <p className="text-xs text-muted-foreground">
                  Pick a color your team can quickly recognize in the shared calendar.
                </p>
              </div>

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dialog.fields.color")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-wrap gap-2">
                        {["sky", "amber", "violet", "rose", "emerald", "orange"].map((c) => (
                          <FormItem key={c} className="flex items-center">
                            <FormControl>
                              <RadioGroupItem
                                value={c}
                                className={cn(
                                  "size-7 border-none shadow-sm ring-2 ring-background",
                                  getEventTailwindColor(c as EventColor)
                                )}
                              />
                            </FormControl>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {error && <ErrorBanner error={error} />}

            <DialogFooter className="flex-row border-t border-border/60 pt-4 sm:justify-between">
              {event?.id && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!userHasDeletionPermession}
                  onClick={() => onDelete(event.id)}>
                  <RiDeleteBinLine size={16} />
                </Button>
              )}
              <div className="flex flex-1 justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("dialog.actions.cancel")}
                </Button>
                <Button type="submit" disabled={isPending || !userHasEditionPermission}>
                  {isPending ? "..." : t("dialog.actions.save")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
