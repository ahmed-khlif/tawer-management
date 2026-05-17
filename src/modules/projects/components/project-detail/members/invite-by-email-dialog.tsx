"use client";

import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Mail,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import useProjectInvitations from "../../../hooks/members/use-project-invitations";
import { cn } from "@/lib/utils";

const inviteSchema = z.object({
  emails: z
    .array(
      z.object({
        value: z.string().trim().email("Please enter a valid email"),
      }),
    )
    .min(1, "Please add at least one email"),
  isManager: z.boolean(),
  expiresInDays: z.coerce.number().min(1).max(30).optional(),
});

type InviteForm = z.infer<typeof inviteSchema>;

interface InviteByEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const EMPTY_EMAIL_ROW = { value: "" };

export function InviteByEmailDialog({
  open,
  onOpenChange,
  projectId,
}: InviteByEmailDialogProps) {
  const t = useTranslations("modules.projects.project.details");
  const { createInvitation, isPending } = useProjectInvitations(projectId);

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      emails: [EMPTY_EMAIL_ROW],
      isManager: false,
      expiresInDays: 7,
    },
    mode: "onChange",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "emails",
  });

  const emailRows = form.watch("emails");
  const normalizedEntries = React.useMemo(
    () =>
      (emailRows ?? [])
        .map((entry) => entry?.value?.trim() ?? "")
        .filter((entry) => entry.length > 0),
    [emailRows],
  );
  const validEmails = React.useMemo(
    () =>
      normalizedEntries.filter((entry) =>
        z.string().email().safeParse(entry).success,
      ),
    [normalizedEntries],
  );
  const uniqueEmails = React.useMemo(
    () => Array.from(new Set(validEmails.map((email) => email.toLowerCase()))),
    [validEmails],
  );
  const invalidFilledEmails = React.useMemo(
    () =>
      normalizedEntries.filter(
        (entry) => !z.string().email().safeParse(entry).success,
      ),
    [normalizedEntries],
  );
  const duplicateCount = validEmails.length - uniqueEmails.length;

  React.useEffect(() => {
    if (!open) {
      form.reset({
        emails: [EMPTY_EMAIL_ROW],
        isManager: false,
        expiresInDays: 7,
      });
    }
  }, [form, open]);

  async function handleSubmit(data: InviteForm) {
    const uniquePayloadEmails = Array.from(
      new Set(
        data.emails
          .map((entry) => entry.value.trim().toLowerCase())
          .filter(Boolean),
      ),
    );

    const failedEmails: string[] = [];
    let sentCount = 0;

    for (const email of uniquePayloadEmails) {
      try {
        await createInvitation(
          {
            email,
            isManager: data.isManager,
            expiresInDays: data.expiresInDays,
          },
          { silent: true },
        );
        sentCount += 1;
      } catch {
        failedEmails.push(email);
      }
    }

    if (sentCount > 0) {
      toast.success(
        sentCount === 1
          ? "Invitation sent"
          : `${sentCount} invitations sent successfully`,
      );
    }

    if (failedEmails.length > 0) {
      toast.error(
        failedEmails.length === 1
          ? `Could not invite ${failedEmails[0]}`
          : `${failedEmails.length} invitations could not be sent`,
      );
      replace(failedEmails.map((email) => ({ value: email })));
      return;
    }

    form.reset({
      emails: [EMPTY_EMAIL_ROW],
      isManager: false,
      expiresInDays: 7,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
        <div className="p-6">
          <DialogHeader>
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="size-6" />
            </div>
            <DialogTitle className="text-xl">
              {t("membersList.invite")}
            </DialogTitle>
            <DialogDescription>
              {t("membersList.inviteDescription", {
                defaultValue:
                  "Invite team members to collaborate on this project. Enter one email per field and use the plus button to add another person.",
              })}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="mt-6 space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>
                    {t("membersList.emailLabel", {
                      defaultValue: "Email addresses",
                    })}
                  </FormLabel>
                  <div className="flex items-center gap-1.5">
                    {uniqueEmails.length > 0 ? (
                      <Badge variant="secondary" className="font-normal">
                        {uniqueEmails.length} ready
                      </Badge>
                    ) : null}
                    {duplicateCount > 0 ? (
                      <Badge variant="outline" className="font-normal">
                        {duplicateCount} duplicate
                        {duplicateCount > 1 ? "s" : ""}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border bg-card p-4">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`emails.${index}.value`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <div className="flex items-start gap-2">
                            <FormControl>
                              <div className="relative flex-1">
                                <Input
                                  {...inputField}
                                  placeholder="email@example.com"
                                  className="h-11 pr-10"
                                />
                                <Mail className="absolute right-3 top-3.5 size-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-11 shrink-0"
                              onClick={() => {
                                if (fields.length === 1) {
                                  form.setValue(`emails.${index}.value`, "");
                                  form.clearErrors(`emails.${index}.value`);
                                  return;
                                }
                                remove(index);
                              }}
                              aria-label="Remove email"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 border-dashed"
                    onClick={() => append(EMPTY_EMAIL_ROW)}
                  >
                    <Plus className="size-4" />
                    Add another email
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Each row accepts one email address only.
                </p>
              </div>

              <div className="grid gap-4 rounded-2xl border bg-muted/25 p-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="isManager"
                  render={({ field }) => (
                    <FormItem className="rounded-xl border bg-background/80 p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className={cn(
                            "rounded-xl p-2 transition-colors",
                            field.value
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <ShieldCheck className="size-4" />
                        </div>
                        <div>
                          <FormLabel className="text-sm font-semibold">
                            {t("membersList.manager")}
                          </FormLabel>
                          <p className="text-[11px] text-muted-foreground">
                            Give elevated access for this project.
                          </p>
                        </div>
                      </div>
                      <FormControl>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium">
                            Grant manager access
                          </span>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      {field.value ? (
                        <div className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-[11px] text-primary">
                          Managers can manage tasks, members, and project settings.
                        </div>
                      ) : null}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresInDays"
                  render={({ field }) => (
                    <FormItem className="rounded-xl border bg-background/80 p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-xl bg-muted p-2 text-muted-foreground">
                          <CalendarClock className="size-4" />
                        </div>
                        <div>
                          <FormLabel className="text-sm font-semibold">
                            {t("invitationsList.expiresInDays", {
                              defaultValue: "Expires in",
                            })}
                          </FormLabel>
                          <p className="text-[11px] text-muted-foreground">
                            Invitations automatically expire after this period.
                          </p>
                        </div>
                      </div>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={30}
                            className="h-9 w-20 text-center font-semibold"
                            {...field}
                          />
                          <span className="text-sm font-medium">days</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(uniqueEmails.length > 0 || invalidFilledEmails.length > 0) && (
                <div className="space-y-3 rounded-2xl border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {uniqueEmails.length > 0 ? (
                      <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                        <CheckCircle2 className="size-3.5" />
                        {uniqueEmails.length} valid invite
                        {uniqueEmails.length > 1 ? "s" : ""}
                      </Badge>
                    ) : null}
                    {invalidFilledEmails.length > 0 ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-destructive/30 bg-destructive/10 text-destructive"
                      >
                        <AlertCircle className="size-3.5" />
                        {invalidFilledEmails.length} invalid
                      </Badge>
                    ) : null}
                  </div>

                  {uniqueEmails.length > 0 ? (
                    <div className="flex max-h-[90px] flex-wrap gap-1.5 overflow-y-auto p-1">
                      {uniqueEmails.slice(0, 12).map((email) => (
                        <Badge
                          key={email}
                          variant="outline"
                          className="h-6 gap-1 bg-background"
                        >
                          {email}
                        </Badge>
                      ))}
                      {uniqueEmails.length > 12 ? (
                        <Badge variant="outline" className="h-6">
                          +{uniqueEmails.length - 12} more
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="rounded-2xl border border-dashed bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                Invitations are processed one by one, so one failed email will not block the others.
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none"
                >
                  {t("membersList.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || uniqueEmails.length === 0}
                  className="flex-1 gap-2 shadow-lg shadow-primary/15 sm:flex-none"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="size-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      {t("membersList.sending")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="size-4" />
                      {uniqueEmails.length > 1
                        ? `Invite ${uniqueEmails.length} members`
                        : t("membersList.invite")}
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
