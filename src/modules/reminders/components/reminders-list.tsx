"use client";

import {
  Activity,
  Bell,
  ChevronLeft,
  ChevronRight,
  MailCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import {
  useMyReminders,
  useProjectReminders,
} from "@/modules/reminders/hooks/use-reminders";
import useReminderUpload from "@/modules/reminders/hooks/use-reminder-upload";
import { ReminderStatus } from "@/modules/reminders/types";
import ReminderCard from "./reminder-card";
import ReminderEditDialog from "./reminder-edit-dialog";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import useProjectPermissions from "@/modules/projects/hooks/permissions/use-project-permissions";



interface RemindersListProps {
  projectId?: string;
  mine?: boolean;
}

const PAGE_SIZE = 10;

const STATUSES: Array<{ value: "ALL" | ReminderStatus; tKey: string }> = [
  { value: "ALL", tKey: "all" },
  { value: "PENDING", tKey: "pending" },
  { value: "SENT", tKey: "sent" },
  { value: "DISMISSED", tKey: "dismissed" },
  { value: "FAILED", tKey: "failed" },
];

export default function RemindersList({
  projectId,
  mine = false,
}: RemindersListProps) {
  const t = useTranslations("modules.projects.project.details.reminders");
  const { user } = useCurrentUser();
  const projectPermissions = useProjectPermissions(projectId ?? "");
  const [status, setStatus] = useState<ReminderStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const reminderParams = {
    status,
    page,
    limit: PAGE_SIZE,
    sortBy: "reminderAtAsc" as const,
  };

  const projectQuery = useProjectReminders(projectId ?? "", reminderParams, {
    enabled: !mine && !!projectId,
  });
  const mineQuery = useMyReminders(reminderParams, { enabled: mine });
  const query = mine ? mineQuery : projectQuery;
  const actions = useReminderUpload(projectId);

  const reminders = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const pagination = query.data?.pagination;
  const totalRecords = pagination?.records ?? reminders.length;
  const totalPages = pagination?.totalPages ?? 1;
  const pendingCount = useMemo(
    () => reminders.filter((r) => r.status === "PENDING").length,
    [reminders],
  );
  const sentCount = useMemo(
    () => reminders.filter((r) => r.status === "SENT").length,
    [reminders],
  );

  const startRecord =
    totalRecords === 0
      ? 0
      : ((pagination?.currentPage ?? page) - 1) * (pagination?.perPage ?? PAGE_SIZE) + 1;
  const endRecord = Math.min(
    startRecord + reminders.length - 1,
    totalRecords,
  );

  return (
    <Card>
      <CardHeader>
        <PageHeaderStrip
          className="border-0 bg-transparent p-0 lg:flex-row"
          icon={Bell}
          iconTone="primary"
          title={t("list.title")}
          description={t("list.subtitle")}
          metrics={[
            {
              icon: Activity,
              value: totalRecords,
              label: t("list.metricsTotal"),
            },
            pendingCount > 0
              ? {
                  value: pendingCount,
                  label: t("list.metricsPending"),
                  tone: "chart-3",
                }
              : false,
            sentCount > 0
              ? {
                  icon: MailCheck,
                  value: sentCount,
                  label: t("list.metricsSent"),
                  tone: "chart-5",
                }
              : false,
          ]}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs
          value={status ?? "ALL"}
          onValueChange={(value) => {
            setStatus(value === "ALL" ? undefined : (value as ReminderStatus));
            setPage(1);
          }}
        >
          <TabsList>
            {STATUSES.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {t(`filters.${option.tKey}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        ) : query.error ? (
          <ErrorBanner
            error={t("list.empty")}
            onRetry={() => void query.refetch()}
          />
        ) : reminders.length === 0 ? (
          <Empty className="border-dashed border bg-muted/30 py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bell className="size-5" />
              </EmptyMedia>
              <EmptyTitle>{t("list.empty")}</EmptyTitle>
              <EmptyDescription>{t("list.emptyHint")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const isPending = reminder.status === "PENDING";
              const isDismissed = reminder.status === "DISMISSED";
              const isOwnReminder = reminder.user?.id === user?.id;

              const canManageProjectReminder =
                !!projectId && projectPermissions.canEditAnyReminder;
              const canEdit =
                canManageProjectReminder &&
                isPending &&
                projectPermissions.canEditReminder;
              const canCancel =
                canManageProjectReminder &&
                isPending &&
                projectPermissions.canCancelReminder;
              const canDismiss =
                !isDismissed &&
                isOwnReminder &&
                (!projectId || projectPermissions.canDismissOwnReminder);
              const canDelete =
                canManageProjectReminder && projectPermissions.canDeleteReminder;
              const hasAnyAction =
                canEdit || canCancel || canDismiss || canDelete;

              return (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  actions={
                    hasAnyAction ? (
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                aria-label={t("actions.more", {
                                  defaultValue: "More actions",
                                })}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            {t("actions.more", { defaultValue: "More actions" })}
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end" className="w-44">
                          {canEdit ? (
                            <DropdownMenuItem
                              onClick={() => setEditingId(reminder.id)}
                            >
                              <Pencil className="size-4 mr-2" />
                              {t("actions.edit")}
                            </DropdownMenuItem>
                          ) : null}
                          {canDismiss ? (
                            <DropdownMenuItem
                              onClick={() =>
                                actions.dismissReminder.mutate(reminder.id)
                              }
                              disabled={actions.dismissReminder.isPending}
                            >
                              <MailCheck className="size-4 mr-2" />
                              {t("actions.dismiss")}
                            </DropdownMenuItem>
                          ) : null}
                          {canCancel ? (
                            <DropdownMenuItem
                              onClick={() =>
                                actions.cancelReminder.mutate(reminder.id)
                              }
                              disabled={actions.cancelReminder.isPending}
                            >
                              <XCircle className="size-4 mr-2" />
                              {t("actions.cancel")}
                            </DropdownMenuItem>
                          ) : null}
                          {canDelete ? (
                            <>
                              {canEdit || canDismiss || canCancel ? (
                                <DropdownMenuSeparator />
                              ) : null}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  actions.deleteReminder.mutate(reminder.id)
                                }
                                disabled={actions.deleteReminder.isPending}
                              >
                                <Trash2 className="size-4 mr-2" />
                                {t("actions.delete")}
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null
                  }
                />
              );
            })}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <span className="text-xs text-muted-foreground">
              {t("pagination.summary", {
                start: startRecord,
                end: endRecord,
                total: totalRecords,
              })}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1"
              >
                <ChevronLeft className="size-3.5" />
                {t("pagination.previous")}
              </Button>
              <span className="text-xs text-muted-foreground">
                {pagination?.currentPage ?? page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1"
              >
                {t("pagination.next")}
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : null}

        {projectId ? (
          <ReminderEditDialog
            projectId={projectId}
            reminderId={editingId}
            open={!!editingId}
            onOpenChange={(open) => !open && setEditingId(null)}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
