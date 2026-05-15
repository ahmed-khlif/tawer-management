"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "@radix-ui/react-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ErrorBanner } from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Columns3 } from "lucide-react";
import { fetchProjectKanbanSettings, updateProjectKanbanSettings } from "@/modules/projects/services/api/project-kanban-settings";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import useTaskStatuses from "@/modules/projects/hooks/tasks/use-task-statuses";

const kanbanSettingsSchema = z.object({
  columns: z.array(
    z.object({
      status: z.string().min(1),
      limit: z.coerce.number().int().min(0),
    }),
  ),
});

type KanbanSettingsFormValues = z.infer<typeof kanbanSettingsSchema>;

interface KanbanSettingsFormProps {
  projectId: string;
}

function KanbanSettingsSkeleton() {
  return <Skeleton className="h-64 w-full" />;
}

function StatusKeyCombobox({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const normalizedValue = value.trim().toLowerCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="h-10 w-full justify-between font-normal"
        >
          <span className="truncate">
            {value || placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search task statuses..." />
          <CommandList>
            <CommandEmpty>No matching status found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      option.toLowerCase() === normalizedValue ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function KanbanSettingsForm({ projectId }: KanbanSettingsFormProps) {
  const t = useTranslations("modules.projects.project.details");
  const queryClient = useQueryClient();
  const { list: statusesQuery } = useTaskStatuses(projectId);
  const settingsQuery = useQuery({
    queryKey: ["project-kanban-settings", projectId],
    queryFn: () => fetchProjectKanbanSettings(projectId),
    enabled: !!projectId,
  });

  const form = useForm<KanbanSettingsFormValues>({
    resolver: zodResolver(kanbanSettingsSchema),
    defaultValues: { columns: [] },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "columns",
  });

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    const nextValues = Object.entries(settingsQuery.data.kanbanSettings ?? {}).map(
      ([status, limit]) => ({
        status,
        limit,
      }),
    );

    replace(nextValues);
  }, [replace, settingsQuery.data]);

  const availableStatuses = useMemo(() => {
    const fromProject = (statusesQuery.data ?? [])
      .map((status) => status.name)
      .filter((statusName): statusName is string => !!statusName);
    const fromSettings = fields
      .map((field) => field.status)
      .filter((statusName): statusName is string => !!statusName);
    return Array.from(new Set([...fromProject, ...fromSettings]));
  }, [fields, statusesQuery.data]);

  const mutation = useMutation({
    mutationFn: (values: KanbanSettingsFormValues) =>
      updateProjectKanbanSettings(projectId, {
        settings: values.columns.reduce<Record<string, number>>((acc, item) => {
          acc[item.status] = item.limit;
          return acc;
        }, {}),
      }),
    onSuccess: async () => {
      toast.success(
        t("settings.kanbanSaved", {
          defaultValue: "Kanban settings updated successfully.",
        }),
      );
      await queryClient.invalidateQueries({
        queryKey: ["project-kanban-settings", projectId],
      });
    },
    onError: () => {
      toast.error(
        t("settings.kanbanSaveError", {
          defaultValue: "Failed to update Kanban settings.",
        }),
      );
    },
  });

  if (settingsQuery.isLoading) {
    return <KanbanSettingsSkeleton />;
  }

  if (settingsQuery.error) {
    return (
      <ErrorBanner
        error={t("settings.kanbanLoadError", {
          defaultValue: "Unable to load Kanban settings.",
        })}
        onRetry={() => void settingsQuery.refetch()}
      />
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Columns3 className="size-5" />
          {t("settings.kanbanTitle", {
            defaultValue: "Kanban WIP settings",
          })}
        </CardTitle>
        <CardDescription>
          {t("settings.kanbanDescription", {
            defaultValue:
              "Configure work-in-progress limits per status to keep your team's flow smooth.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <Empty className="border-dashed border bg-muted/30 py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Columns3 className="size-5" />
              </EmptyMedia>
              <EmptyTitle>
                {t("settings.kanbanEmpty", {
                  defaultValue: "No work-in-progress limits configured.",
                })}
              </EmptyTitle>
              <EmptyDescription>
                {t("settings.kanbanEmptyHint", {
                  defaultValue:
                    "Set per-status WIP limits to keep your team focused.",
                })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <FieldGroup className="gap-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-lg border p-4 md:grid-cols-[2fr_1fr_auto] items-end bg-card"
              >
                <Field>
                  <FieldContent>
                    <FieldLabel>
                      {t("settings.statusKey", { defaultValue: "Status key" })}
                    </FieldLabel>
                    <StatusKeyCombobox
                      value={form.watch(`columns.${index}.status`) || ""}
                      onChange={(next) =>
                        form.setValue(`columns.${index}.status`, next, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      options={availableStatuses}
                      placeholder={t("settings.statusKeyPlaceholder", {
                        defaultValue: "Select a task status",
                      })}
                    />
                    <FieldDescription>
                      {t("settings.statusKeyHint", {
                        defaultValue:
                          "Search and pick one of this project's real task statuses.",
                      })}
                    </FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldContent>
                    <FieldLabel>
                      {t("settings.wipLimit", { defaultValue: "WIP limit" })}
                    </FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      {...form.register(`columns.${index}.limit`, {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldDescription>
                      {t("settings.wipLimitHint", {
                        defaultValue:
                          "0 disables the limit for this status.",
                      })}
                    </FieldDescription>
                  </FieldContent>
                </Field>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label="Remove column"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </FieldGroup>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                status:
                  availableStatuses.find(
                    (status) =>
                      !fields.some((field) => field.status.toLowerCase() === status.toLowerCase()),
                  ) ?? "",
                limit: 0,
              })
            }
          >
            <Plus className="mr-2 size-4" />
            {t("settings.addColumn", { defaultValue: "Add column" })}
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit((values) => mutation.mutate(values))}
            disabled={mutation.isPending}
          >
            <Save className="mr-2 size-4" />
            {t("settings.saveKanban", { defaultValue: "Save settings" })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default KanbanSettingsForm;
