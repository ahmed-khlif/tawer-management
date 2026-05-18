"use client";;
import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorBanner } from "@/components/error-banner";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import useUsers from "@/modules/users/hooks/extraction/use-users";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useServerUpload from "@/modules/infrastructure/hooks/uploads/server";
import { ServerStatusType, ServerType } from "@/modules/infrastructure/types/servers";
import TextEditor from "@/components/ui/text-editor";
import TimeInput from "@/components/time-input";

interface Props {
  onFinish: () => void
  server?: ServerType
}

export default function ServerUploadForm({ onFinish, server = undefined }: Props) {
  const t = useTranslations("modules.infrastructure.servers")

  const { form, isPending, onSubmit, error } = useServerUpload({
    server,
    onSuccess: () => {
      form.reset()
      onFinish()
    },
  })

  const { users, usersAreLoading } = useUsers({})
  const managerCount = form.watch("managers")?.length ?? 0;

  useEffect(() => {
    if (server) {
      form.reset({
        name: server.name,
        domain: server.domain,
        description: server.description,
        ip: server.ip,
        cpus: server.cpus,
        ram: server.ram,
        storage: server.storage,
        bandwidth: server.bandwidth,
        status: server.status,
        backupCloudProvider: server.backupCloudProvider,
        paid: server.paid,
        paidAt: server.paidAt,
        expiredAt: server.expiredAt,
        managers: server.managers.map((m) => m.id),
      })
    }
  }, [server])

  const onStatusChanged = (status: ServerStatusType) => {
    if (status)
      form.setValue("status", status);

  }

  if (usersAreLoading) return <Loading />
  if (!users) return <Error500 />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Server identity</h3>
            <p className="text-xs text-muted-foreground">
              Define the core host record your team will reference across services and operations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
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
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.domain")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.domain")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.ip")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.ip")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.status")}</FormLabel>
                  <Select value={field.value} onValueChange={onStatusChanged}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Running">{t("upload.form.statuses.running")}</SelectItem>
                      <SelectItem value="Stopped">{t("upload.form.statuses.stopped")}</SelectItem>
                      <SelectItem value="Maintenance">{t("upload.form.statuses.maintenance")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-background to-transparent p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Capacity and lifecycle</h3>
            <p className="text-xs text-muted-foreground">
              Capture the hardware profile, ownership state, and renewal timeline in one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              name="cpus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.cpus")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.cpus")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="ram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.ram")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.ram")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="storage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.storage")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.storage")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="bandwidth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.bandwidth")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.bandwidth")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FormField
              name="backupCloudProvider"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/90 p-3 shadow-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>{t("upload.form.labels.backupCloudProvider")}</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Track whether disaster recovery is delegated to a cloud backup provider.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              name="paid"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/90 p-3 shadow-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>{t("upload.form.labels.paid")}</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Use this when billing is already settled for the current subscription period.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TimeInput inputName="paidAt" dateLabel={t("upload.form.labels.paidDate")} timeLabel={t("upload.form.labels.paidTime")} />
            <TimeInput inputName="expiredAt" dateLabel={t("upload.form.labels.expiredDate")} timeLabel={t("upload.form.labels.expiredTime")} />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Ownership and notes</h3>
              <p className="text-xs text-muted-foreground">
                Assign operational owners and document the context other admins need before touching this host.
              </p>
            </div>
            <span className="rounded-full border border-primary/15 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
              {managerCount} manager{managerCount === 1 ? "" : "s"} selected
            </span>
          </div>

          <FormField
            name="managers"
            render={({ field }) => (
              <FormItem className="mb-4">
                <Label>{t("upload.form.labels.managers")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-2 w-full justify-between bg-transparent">
                      <span className="flex items-center gap-2">
                        <PlusCircle className="size-4" />
                        {managerCount > 0
                          ? `${managerCount} manager${managerCount === 1 ? "" : "s"} selected`
                          : t("upload.form.labels.managers")}
                      </span>
                      <span className="text-xs text-muted-foreground">Manage owners</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0">
                    <Command>
                      <CommandInput placeholder={t("upload.form.placeholders.managers")} className="h-9" />

                      <CommandList>
                        <CommandEmpty>{t("upload.form.noResults.managers")}</CommandEmpty>

                        <CommandGroup>
                          <FormControl>
                            <CommandGroup>
                              {users &&
                                users.map((user) => (
                                  <CommandItem key={user.id} value={user.id}>
                                    <div className="flex items-center space-x-3 py-1">
                                      <Checkbox
                                        id={user.id}
                                        checked={field.value?.includes(user.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...(field.value ?? []), user.id]);
                                          } else {
                                            field.onChange(
                                              field.value?.filter((value: string) => value !== user.id)
                                            );
                                          }
                                        }} />

                                      <label htmlFor={user.id} className="flex cursor-pointer items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                          <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                                          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>{user.name}</div>
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

          <FormField
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("upload.form.labels.description")}</FormLabel>
                <FormControl>
                  <TextEditor
                    initialContent={server?.description || ""}
                    placeholder={t("upload.form.placeholders.description")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error !== "" && <ErrorBanner error={error} />}

        <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
          <Button type="button" variant="outline" onClick={onFinish} disabled={isPending}>
            {t("upload.form.actions.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("upload.form.actions.creating")
              : server
                ? t("upload.form.actions.updateServer")
                : t("upload.form.actions.createServer")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
