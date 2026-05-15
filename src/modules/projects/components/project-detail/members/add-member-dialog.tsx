"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { 
  Plus, 
  Search, 
  Mail, 
  Users, 
  ShieldCheck, 
  Shield, 
  UserPlus,
  Send,
  Calendar,
  X,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import UserSearchCombobox from "./user-search-combobox";
import useProjectMembers from "../../../hooks/members/use-project-members";
import useProjectInvitations from "../../../hooks/members/use-project-invitations";
import useProjectPermissions from "../../../hooks/permissions/use-project-permissions";
import { cn } from "@/lib/utils";

const addMemberSchema = z.object({
  value: z.string().min(1, "Selection is required"),
  isManager: z.boolean(),
  expiresInDays: z.coerce.number().min(1).max(30).optional(),
  mode: z.enum(["userId", "email"]),
});

type AddMemberForm = z.infer<typeof addMemberSchema>;

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function AddMemberDialog({ open, onOpenChange, projectId }: AddMemberDialogProps) {
  const t = useTranslations("modules.projects.project.details");
  const { addMember, isPending: isAddingMember } = useProjectMembers(projectId);
  const { createInvitation, isPending: isCreatingInvitation } = useProjectInvitations(projectId);
  const permissions = useProjectPermissions(projectId);

  const isPending = isAddingMember || isCreatingInvitation;
  const canAddByUserId = permissions.canDirectAddMembers;

  const form = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { 
      value: "", 
      isManager: false, 
      expiresInDays: 7, 
      mode: "userId" 
    },
  });

  React.useEffect(() => {
    if (!open) return;

    form.reset({
      value: "",
      isManager: false,
      expiresInDays: 7,
      mode: canAddByUserId ? "userId" : "email",
    });
  }, [canAddByUserId, form, open]);

  const mode = form.watch("mode");

  async function handleSubmit(data: AddMemberForm) {
    try {
      if (data.mode === "userId") {
        if (!canAddByUserId) {
          form.setError("value", {
            type: "manual",
            message: "Direct member add is restricted to executives.",
          });
          return;
        }

        await addMember({
          userId: data.value, 
          isManager: data.isManager 
        });
      } else {
        await createInvitation({ 
          email: data.value, 
          isManager: data.isManager, 
          expiresInDays: data.expiresInDays 
        });
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl">
        <div className="relative h-2 w-full bg-primary/20">
          <div 
            className="absolute h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: !canAddByUserId || mode === "email" ? "100%" : "50%" }}
          />
        </div>
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                {mode === "userId" ? <UserPlus className="size-5" /> : <Send className="size-5" />}
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {mode === "userId" ? t("membersList.addMember") : t("membersList.invite")}
                </DialogTitle>
                <DialogDescription>
                  {mode === "userId" 
                    ? "Add an existing user from the platform to your project."
                    : "Send an email invitation to someone new."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs 
                value={mode} 
                onValueChange={(v) => {
                  form.setValue("mode", v as "userId" | "email");
                  form.setValue("value", "");
                  form.clearErrors("value");
                }}
                className="w-full"
              >
                <TabsList
                  className={cn(
                    "grid w-full h-11 p-1 bg-muted/50 rounded-lg",
                    canAddByUserId ? "grid-cols-2" : "grid-cols-1",
                  )}
                >
                  {canAddByUserId ? (
                    <TabsTrigger value="userId" className="gap-2 rounded-md">
                      <Search className="size-4" />
                      <span>{t("membersList.byUser")}</span>
                    </TabsTrigger>
                  ) : null}
                  <TabsTrigger value="email" className="gap-2 rounded-md">
                    <Mail className="size-4" />
                    <span>{t("membersList.byEmail")}</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    {canAddByUserId ? (
                      <div
                        className={cn(
                          "rounded-xl border p-3 transition-colors",
                          mode === "userId"
                            ? "border-primary/30 bg-primary/5"
                            : "bg-muted/20",
                        )}
                      >
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                          <Search className="size-4" />
                          Add existing teammate
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Search the workspace and add someone immediately.
                        </p>
                      </div>
                    ) : null}
                    <div
                      className={cn(
                        "rounded-xl border p-3 transition-colors",
                        mode === "email"
                          ? "border-primary/30 bg-primary/5"
                          : "bg-muted/20",
                      )}
                    >
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                        <Mail className="size-4" />
                        Send invitation
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Invite someone by email and let them join later.
                      </p>
                    </div>
                  </div>

                  <FormField 
                    control={form.control} 
                    name="value" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {mode === "userId" ? t("membersList.userIdLabel") : t("membersList.emailLabel")}
                        </FormLabel>
                        <FormControl>
                          {mode === "userId" ? (
                            <UserSearchCombobox 
                              value={field.value} 
                              onChange={(userId) => field.onChange(userId)}
                              placeholder="Search by name or email..."
                            />
                          ) : (
                            <div className="relative group">
                              <Input 
                                placeholder="name@example.com" 
                                className="h-11 pl-10 transition-all focus-visible:ring-primary/20" 
                                {...field} 
                              />
                              <Mail className="absolute left-3 top-3.5 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                          )}
                        </FormControl>
                        <FormDescription>
                          {mode === "userId"
                            ? "Choose a real account from your workspace."
                            : "We'll send an invitation link to this address."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </div>
              </Tabs>

              <div className="space-y-4 pt-2">
                <FormField 
                  control={form.control} 
                  name="isManager" 
                  render={({ field }) => (
                    <FormItem className="relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            field.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {field.value ? <ShieldCheck className="size-5" /> : <Shield className="size-5" />}
                          </div>
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-semibold leading-none">
                              {t("membersList.manager")}
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Grant administrative privileges for this project.
                            </p>
                          </div>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                            className="data-[state=checked]:bg-primary"
                          />
                        </FormControl>
                      </div>
                      
                      {field.value && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 p-2 text-[11px] text-primary">
                          <div className="flex -space-x-1">
                            <CheckCircle2 className="size-3" />
                          </div>
                          <span>Can manage tasks, sprints, and project settings.</span>
                        </div>
                      )}
                    </FormItem>
                  )} 
                />

                {mode === "email" && (
                  <FormField 
                    control={form.control} 
                    name="expiresInDays" 
                    render={({ field }) => (
                      <FormItem className="rounded-xl border bg-card p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                              <Calendar className="size-5" />
                            </div>
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-semibold leading-none">
                                {t("invitationsList.expiresInDays")}
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                Link automatically expires after this period.
                              </p>
                            </div>
                          </div>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="number" 
                                min={1} 
                                max={30} 
                                className="h-9 w-16 text-center font-medium" 
                                {...field} 
                              />
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Days</span>
                            </div>
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                )}
              </div>

              <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                {mode === "userId"
                  ? "Direct add gives access immediately."
                  : "Email invitations can expire automatically and be resent from the invitations tab."}
              </div>

              <DialogFooter className="pt-2 gap-3 sm:gap-0">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none h-11"
                >
                  {t("membersList.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending || !form.watch("value")}
                  className="flex-1 sm:flex-none h-11 px-8 shadow-lg shadow-primary/20"
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      <span>{mode === "userId" ? t("membersList.adding") : t("membersList.sending")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {mode === "userId" ? <UserPlus className="size-4" /> : <Send className="size-4" />}
                      <span>{mode === "userId" ? t("membersList.addMember") : t("membersList.invite")}</span>
                    </div>
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
