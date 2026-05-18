"use client";

import DOMPurify from "dompurify";
import { format } from "date-fns";
import { Activity, CalendarRange, Layers3, Target } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import useSprintAiCapacity from "@/modules/projects/hooks/sprints/use-sprint-ai-capacity";
import useSprintBurndown from "@/modules/projects/hooks/sprints/use-sprint-burndown";
import useSprint from "@/modules/projects/hooks/sprints/use-sprint";
import useProjectPermissions from "@/modules/projects/hooks/permissions/use-project-permissions";
import { SprintType } from "@/modules/projects/types/project-sprints";
import SetReminderButton from "@/modules/reminders/components/set-reminder-button";
import SprintBurndownChart from "./sprint-burndown-chart";
import SprintAttachmentsSection from "./sprint-attachments-section";
import SprintTasksSection from "./sprint-tasks-section";

interface SprintDetailSheetProps {
  projectId: string;
  sprint: SprintType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toPlainTextDescription(value?: string | null) {
  if (!value) return "—";
  const sanitized = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  const normalized = sanitized.replace(/\s+/g, " ").trim();
  return normalized || "—";
}

export default function SprintDetailSheet({
  projectId,
  sprint: summarySprint,
  open,
  onOpenChange,
}: SprintDetailSheetProps) {
  const { data: detailedSprint } = useSprint(summarySprint?.id, {
    enabled: open && !!summarySprint?.id,
  });
  const sprint = detailedSprint ?? summarySprint;
  const plainDescription = toPlainTextDescription(sprint?.description);

  const burndownQuery = useSprintBurndown(sprint?.id);
  const aiCapacityQuery = useSprintAiCapacity(projectId, sprint?.id);
  const permissions = useProjectPermissions(projectId);
  const totalTasks = sprint?.tasks?.length ?? 0;
  const completedTasks =
    sprint?.tasks?.filter((task) =>
      ["DONE", "COMPLETED"].includes(task.status?.toUpperCase?.() ?? ""),
    ).length ?? 0;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        {!sprint ? null : (
          <>
            <SheetHeader>
              <div className="flex items-center justify-between gap-2 pe-6">
                <SheetTitle>{sprint.name}</SheetTitle>
                {permissions.canCreateReminder ? (
                  <SetReminderButton
                    projectId={projectId}
                    entityType="SPRINT"
                    entityId={sprint.id}
                    entityLabel={`Sprint: ${sprint.name}`}
                    defaultMessage={`Reminder for sprint ${sprint.name}`}
                  />
                ) : null}
              </div>
            </SheetHeader>
            <div className="space-y-4 p-4">
              <Card className="overflow-hidden border-border/60">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Badge variant="outline">{sprint.status}</Badge>
                      <div>
                        <p className="text-2xl font-semibold tracking-tight">{sprint.name}</p>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                          {plainDescription}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Delivery pace
                      </p>
                      <p className="mt-1 text-3xl font-semibold">{progressPercent}%</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarRange className="size-4" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Window</p>
                      </div>
                      <p className="mt-2 text-sm font-medium">
                        {format(sprint.startDate, "PPP")} - {format(sprint.endDate, "PPP")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="size-4" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Capacity</p>
                      </div>
                      <p className="mt-2 text-sm font-medium">{sprint.capacity ?? "Not set"}</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="size-4" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Tasks</p>
                      </div>
                      <p className="mt-2 text-sm font-medium">{completedTasks}/{totalTasks} completed</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Layers3 className="size-4" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Epic spread</p>
                      </div>
                      <p className="mt-2 text-sm font-medium">{sprint.epicBreakdown?.length ?? 0} linked epics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Info</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Status</p>
                    <Badge variant="secondary">{sprint.status}</Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Dates</p>
                    <p className="text-sm">
                      {format(sprint.startDate, "PPP")} - {format(sprint.endDate, "PPP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Capacity</p>
                    <p className="text-sm">{sprint.capacity ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Description</p>
                    <p className="text-sm">{plainDescription}</p>
                  </div>
                </CardContent>
              </Card>

              <SprintTasksSection projectId={projectId} sprint={sprint} />

              <SprintAttachmentsSection
                projectId={projectId}
                sprintId={sprint.id}
                canManage={permissions.canManageSprintAttachments}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Burndown</CardTitle>
                </CardHeader>
                <CardContent>
                  {burndownQuery.isLoading ? (
                    <Skeleton className="h-72 w-full" />
                  ) : burndownQuery.error ? (
                    <ErrorBanner error="Unable to load sprint burndown." />
                  ) : burndownQuery.data && burndownQuery.data.chartData?.length > 0 ? (
                    <SprintBurndownChart burndown={burndownQuery.data} />
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>No burndown data</EmptyTitle>
                        <EmptyDescription>
                          This sprint does not have enough tracking data yet.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI capacity signal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiCapacityQuery.isLoading ? (
                    <Skeleton className="h-32 w-full" />
                  ) : aiCapacityQuery.error ? (
                    <ErrorBanner error="Unable to load AI capacity signal." />
                  ) : aiCapacityQuery.data ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            aiCapacityQuery.data.riskLevel === "HIGH"
                              ? "destructive"
                              : aiCapacityQuery.data.riskLevel === "MEDIUM"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {aiCapacityQuery.data.riskLevel}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Utilization {Math.round(aiCapacityQuery.data.utilizationPercent)}%
                        </span>
                      </div>
                      {aiCapacityQuery.data.recommendations.length ? (
                        <div className="space-y-2">
                          {aiCapacityQuery.data.recommendations.map((item) => (
                            <p key={item} className="text-sm text-muted-foreground">
                              - {item}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No AI signal available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
