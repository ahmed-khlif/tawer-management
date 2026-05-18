"use client";;
import { useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import useUserUpload from "@/modules/users/hooks/user-upload";
import useUserRoles from "@/modules/auth/hooks/users/roles";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { UserType } from "../../types/users";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorBanner } from "@/components/error-banner";
import { castRoleFromFrontendToBackend } from "@/modules/auth/utils/user-roles";
import { UserRoleOnBackendSide } from "@/modules/auth/types";
import { Label } from "@/components/ui/label";
import ProfileImageUpload from "@/components/images-upload/profile-image-upload";
import { cn } from "@/lib/utils";

interface UserCreationFormProps {
  onFinish: () => void;
  user?: UserType;
}

export default function UserUploadForm({ onFinish, user = undefined }: UserCreationFormProps) {
  const t = useTranslations("modules.users");

  const { form, isPending, onSubmit, error } = useUserUpload({
    onSuccess: () => {
      form.reset();
      onFinish();
    },
    user
  });

  const { roles, rolesAreLoading } = useUserRoles();
  const selectedRolesCount = form.watch("roles")?.length ?? 0;
  const notificationCount = [
    form.watch("emailNotifications"),
    form.watch("telegramNotifications"),
    form.watch("ntfyNotifications"),
  ].filter(Boolean).length;

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles.map((role) =>
          castRoleFromFrontendToBackend(role)
        ) as UserRoleOnBackendSide[],
        imageUrl: user.image || "",
        emailNotifications: user.notificationsSettings.emailNotifications,
        telegramNotifications: user.notificationsSettings.telegramNotifications,
        ntfyNotifications: user.notificationsSettings.ntfyNotifications,
        telegramChatId: user.notificationsSettings.telegramChatId ? user.notificationsSettings.telegramChatId : ""
      });
    }
  }, [user]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Identity and contact</h3>
            <p className="text-xs text-muted-foreground">
              Set up the profile details teammates will use across projects, activity, and assignments.
            </p>
          </div>

          <div className="space-y-4">
            <ProfileImageUpload
              defaultImageUrl={form.watch(`imageUrl`)}
              defaultImageUrlInputName={`imageUrl`}
              inputName={`image`}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.fullName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("upload.form.placeholders.fullName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.email")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("upload.form.placeholders.email")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.phone")}</FormLabel>
                    <FormControl>
                      <Input type="phone" placeholder={t("upload.form.placeholders.phone")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!user && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("upload.form.labels.password")}</FormLabel>
                      <FormControl>
                        <Input
                          isPasswordInput={true}
                          placeholder={t("upload.form.placeholders.password")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-background to-transparent p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Access and delivery channels</h3>
              <p className="text-xs text-muted-foreground">
                Define product permissions and how this member receives PM updates.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-primary/15 bg-background/80 px-2.5 py-1">
                {selectedRolesCount} role{selectedRolesCount === 1 ? "" : "s"} selected
              </span>
              <span className="rounded-full border border-primary/15 bg-background/80 px-2.5 py-1">
                {notificationCount} channel{notificationCount === 1 ? "" : "s"} enabled
              </span>
            </div>
          </div>

          <FormField
            name="roles"
            control={form.control}
            render={({ field }) => (
              <FormItem className="mb-4">
                <Label>{t("upload.form.labels.roles")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-2 w-full justify-between bg-background/90"
                      disabled={rolesAreLoading}
                    >
                      <span className="flex items-center gap-2">
                        <PlusCircle className="size-4" />
                        {selectedRolesCount > 0
                          ? `${selectedRolesCount} role${selectedRolesCount === 1 ? "" : "s"} selected`
                          : t("upload.form.labels.roles")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {rolesAreLoading ? "Loading..." : "Open"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0">
                    <Command>
                      <CommandInput
                        placeholder={t("table.filters.roles.placeholder")}
                        className="h-9"
                      />

                      <CommandList>
                        <CommandEmpty>{t("table.filters.roles.noResults")}</CommandEmpty>

                        <CommandGroup>
                          <FormControl>
                            <CommandGroup>
                              {roles?.map((role) => (
                                <CommandItem key={role.value} value={role.value}>
                                  <div className="flex items-center space-x-3 py-1">
                                    <Checkbox
                                      id={role.value}
                                      checked={field.value?.includes(role.value)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...(field.value ?? []), role.value]);
                                        } else {
                                          field.onChange(
                                            field.value?.filter((value) => value !== role.value)
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={role.value}
                                      className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      {role.label}
                                    </label>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </FormControl>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>{t("upload.form.labels.notificationMethod")}</FormLabel>

            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {[
                {
                  name: "emailNotifications" as const,
                  label: t("upload.form.options.email"),
                  hint: "Inbox alerts and PM summaries",
                },
                {
                  name: "telegramNotifications" as const,
                  label: t("upload.form.options.telegram"),
                  hint: "Instant delivery for urgent updates",
                },
                {
                  name: "ntfyNotifications" as const,
                  label: t("upload.form.options.ntfy"),
                  hint: "Push alerts for lightweight setups",
                },
              ].map((option) => (
                <FormField
                  key={option.name}
                  control={form.control}
                  name={option.name}
                  render={({ field }) => (
                    <FormItem className={cn(
                      "flex items-start gap-3 rounded-xl border border-border/70 bg-background/90 p-3 shadow-sm transition-colors",
                      field.value ? "border-primary/20 bg-primary/[0.03]" : ""
                    )}>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="cursor-pointer font-medium">
                          {option.label}
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">{option.hint}</p>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormMessage />
          </FormItem>

          {form.watch("telegramNotifications") && (
            <FormField
              control={form.control}
              name="telegramChatId"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>
                    {t("upload.form.labels.telegramChatId")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("upload.form.placeholders.telegramChatId")}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Add the destination chat so Telegram alerts land in the right workspace.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {error !== "" && <ErrorBanner error={error} />}

        <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
          <Button type="button" variant="outline" onClick={onFinish} disabled={isPending}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("actions.creating")
              : user
                ? t("actions.updateUser")
                : t("actions.createUser")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
