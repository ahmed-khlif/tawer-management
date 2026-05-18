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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useServiceUpload from "@/modules/infrastructure/hooks/uploads/service";
import type { ServiceStatusType, ServiceType } from "@/modules/infrastructure/types/services";
import useServers from "@/modules/infrastructure/hooks/extractions/servers";
import TextEditor from "@/components/ui/text-editor";
import TimeInput from "@/components/time-input";

interface Props {
  onFinish: () => void
  service?: ServiceType
}

export default function ServiceUploadForm({ onFinish, service = undefined }: Props) {
  const t = useTranslations("modules.infrastructure.services")

  const { form, isPending, onSubmit, error } = useServiceUpload({
    service,
    onSuccess: () => {
      form.reset()
      onFinish()
    },
  })

  const { servers, serversAreLoading } = useServers({})

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        domain: service.domain,
        description: service.description,
        status: service.status,
        sslCertificate: service.sslCertificate,
        sslCertificateByCloudProvider: service.sslCertificateByCloudProvider,
        hasBackup: service.hasBackup,
        backupDestination: service.backupDestination,
        paid: service.paid,
        paidAt: service.paidAt,
        expiredAt: service.expiredAt,
        serverId: service.server.id,
      })
    }
  }, [service])

  const onStatusChanged = (status: ServiceStatusType) => {
    if (status)
      form.setValue("status", status);

  }
  const selectedServer = servers?.find((server) => server.id === form.watch("serverId"));

  if (serversAreLoading) return <Loading />
  if (!servers) return <Error500 />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Service profile</h3>
            <p className="text-xs text-muted-foreground">
              Capture the customer-facing identity, lifecycle status, and context for this service.
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
              name="status"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
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

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>{t("upload.form.labels.description")}</FormLabel>
                  <FormControl>
                    <TextEditor
                      initialContent={service?.description || ""}
                      placeholder={t("upload.form.placeholders.description")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-background to-transparent p-4 shadow-sm">
          <div className="mb-4 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Reliability and billing</h3>
            <p className="text-xs text-muted-foreground">
              Keep backup, certificate, and subscription details in the same operating view.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              name="sslCertificate"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/90 p-3 shadow-sm">
                  <FormControl>
                    <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel htmlFor={field.name}>{t("upload.form.labels.sslCertificate")}</FormLabel>
                    <p className="text-xs text-muted-foreground">Track whether TLS is already active for this service.</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              name="sslCertificateByCloudProvider"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/90 p-3 shadow-sm">
                  <FormControl>
                    <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel htmlFor={field.name}>{t("upload.form.labels.sslCertificateByCloudProvider")}</FormLabel>
                    <p className="text-xs text-muted-foreground">Mark this when certificate handling is delegated externally.</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              name="hasBackup"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/90 p-3 shadow-sm">
                  <FormControl>
                    <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel htmlFor={field.name}>{t("upload.form.labels.hasBackup")}</FormLabel>
                    <p className="text-xs text-muted-foreground">Use this to highlight recovery coverage for the service.</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              name="paid"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/90 p-3 shadow-sm">
                  <FormControl>
                    <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel htmlFor={field.name}>{t("upload.form.labels.paid")}</FormLabel>
                    <p className="text-xs text-muted-foreground">Show whether the current billing window is already covered.</p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField
              name="backupDestination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.backupDestination")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.backupDestination")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
              <TimeInput inputName="paidAt" dateLabel={t("upload.form.labels.paidDate")} timeLabel={t("upload.form.labels.paidTime")} />
              <TimeInput inputName="expiredAt" dateLabel={t("upload.form.labels.expiredDate")} timeLabel={t("upload.form.labels.expiredTime")} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Deployment host</h3>
              <p className="text-xs text-muted-foreground">
                Link the service to its primary host so operations, incidents, and PM reporting stay aligned.
              </p>
            </div>
            <span className="rounded-full border border-primary/15 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
              {selectedServer ? `Linked: ${selectedServer.name}` : "No server linked"}
            </span>
          </div>

          <FormField
            name="serverId"
            render={({ field }) => (
              <FormItem>
                <Label>{t("upload.form.labels.serverId")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-2 w-full justify-between bg-transparent">
                      <span className="flex items-center gap-2">
                        <PlusCircle className="size-4" />
                        {selectedServer ? selectedServer.name : t("upload.form.labels.serverId")}
                      </span>
                      <span className="text-xs text-muted-foreground">Choose host</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0">
                    <Command>
                      <CommandInput placeholder={t("upload.form.placeholders.serverId")} className="h-9" />

                      <CommandList>
                        <CommandEmpty>{t("upload.form.noResults.serverId")}</CommandEmpty>

                        <CommandGroup>
                          <FormControl>
                            <CommandGroup>
                              <RadioGroup value={field.value || ""} onValueChange={(val) => field.onChange(val)}>
                                {servers &&
                                  servers.map((server) => (
                                    <CommandItem key={server.id} value={server.id}>
                                      <div className="flex items-center space-x-3 py-1">
                                        <RadioGroupItem value={server.id} id={server.id} />

                                        <label htmlFor={server.id} className="flex cursor-pointer items-center gap-3">
                                          <div>{server.name}</div>
                                        </label>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </RadioGroup>
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
        </div>

        {error !== "" && <ErrorBanner error={error} />}

        <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
          <Button type="button" variant="outline" onClick={onFinish} disabled={isPending}>
            {t("upload.form.actions.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("upload.form.actions.creating")
              : service
                ? t("upload.form.actions.updateService")
                : t("upload.form.actions.createService")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
