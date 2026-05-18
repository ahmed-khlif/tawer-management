"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CalendarCheck2,
  ChevronRight,
  CheckCircle2,
  Download,
  FolderKanban,
  Sigma,
  TimerReset,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import AccessDenied from "@/components/error/access-denied";
import { ErrorBanner } from "@/components/error-banner";
import { ExportMenuButton } from "@/components/export-menu-button";
import Loading from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/modules/projects/components/shared/metric-card";
import {
  useEmployeeAnalyticsSnapshot,
  useEmployeeAnalyticsSummary,
  useEmployeeProductivityMetrics,
} from "@/modules/analytics/hooks/use-analytics";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { resolveEmployeeAnalyticsAccess } from "@/modules/analytics/utils/access";
import { canExportEmployeeAnalytics } from "@/modules/analytics/utils/access";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { exportReportToPdfPrintWindow, exportRowsToCsv } from "@/lib/report-export";

interface Props {
  userId: string;
}

export default function EmployeeAnalyticsPageRender({ userId }: Props) {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [exporting, setExporting] = useState<null | "csv" | "pdf">(null);
  const summaryQuery = useEmployeeAnalyticsSummary(userId);
  const productivityQuery = useEmployeeProductivityMetrics(userId);
  const snapshotQuery = useEmployeeAnalyticsSnapshot(userId);

  const access = resolveEmployeeAnalyticsAccess({
    currentUser: user,
    targetUserId: userId,
  });
  const isForbidden =
    (isAxiosError(summaryQuery.error) && summaryQuery.error.response?.status === 403) ||
    (isAxiosError(productivityQuery.error) &&
      productivityQuery.error.response?.status === 403);
  const canExport = canExportEmployeeAnalytics(access);

  if (isUserLoading) {
    return <Loading />;
  }
  if (!user) {
    return <AccessDenied />;
  }
  if (!access.canLoad) {
    return <AccessDenied />;
  }
  if (isForbidden) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href={access.backHref}>
            <ArrowLeft className="mr-2 size-4" />
            {access.backLabel}
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Employee Analytics Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This employee analytics view is only available for your own profile,
              executive access, or teammates who share a project context with you.
            </p>
            <p>
              Open this page from a shared project when applicable, or return to a
              project workspace to continue.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summaryLoading = summaryQuery.isLoading;
  const productivityLoading = productivityQuery.isLoading;
  const onTimeRate = productivityQuery.data?.onTimeRatePercent ?? 0;
  const lateCompleted = productivityQuery.data?.lateCompletedTasks ?? 0;
  const healthyLoadLabel =
    onTimeRate >= 80
      ? "Healthy Load"
      : onTimeRate >= 55
        ? "Watch"
        : "Overloaded";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href={access.backHref}>
            <ArrowLeft className="mr-2 size-4" />
            {access.backLabel}
          </Link>
        </Button>
        {canExport ? (
          <ExportMenuButton
            exporting={exporting}
            onExportCsv={() => {
              if (!summaryQuery.data || !productivityQuery.data) return;
              setExporting("csv");
              try {
                exportRowsToCsv(
                  `employee-analytics-${userId}-${new Date().toISOString().slice(0, 10)}.csv`,
                  [
                    { key: "metric", label: "Metric" },
                    { key: "value", label: "Value" },
                  ],
                  [
                    { metric: "User", value: summaryQuery.data.userName ?? "Employee" },
                    { metric: "Assigned tasks", value: summaryQuery.data.totalAssignedTasks },
                    { metric: "Open assigned", value: summaryQuery.data.openAssignedTasks },
                    { metric: "Completed assigned", value: summaryQuery.data.completedAssignedTasks },
                    { metric: "Story points assigned", value: summaryQuery.data.totalStoryPointsAssigned },
                    { metric: "Story points completed", value: summaryQuery.data.completedStoryPoints },
                    { metric: "Hours logged", value: productivityQuery.data.hoursLogged },
                    { metric: "Tasks completed", value: productivityQuery.data.tasksCompleted },
                    { metric: "On-time completed tasks", value: productivityQuery.data.onTimeCompletedTasks },
                    { metric: "Late completed tasks", value: productivityQuery.data.lateCompletedTasks },
                    { metric: "On-time rate", value: `${Math.round(onTimeRate)}%` },
                  ],
                );
              } finally {
                setExporting(null);
              }
            }}
            onExportPdf={() => {
              if (!summaryQuery.data || !productivityQuery.data) return;
              setExporting("pdf");
              try {
                exportReportToPdfPrintWindow({
                  filename: `employee-analytics-${userId}-${new Date().toISOString().slice(0, 10)}.pdf`,
                  title: `${summaryQuery.data.userName ?? "Employee"} Analytics`,
                  subtitle: "Workload, delivery reliability, and recent trend signals.",
                  sections: [
                    {
                      title: "Task summary",
                      rows: [
                        { label: "Assigned tasks", value: String(summaryQuery.data.totalAssignedTasks) },
                        { label: "Open assigned", value: String(summaryQuery.data.openAssignedTasks) },
                        { label: "Completed assigned", value: String(summaryQuery.data.completedAssignedTasks) },
                        { label: "Story points assigned", value: String(summaryQuery.data.totalStoryPointsAssigned) },
                        { label: "Story points completed", value: String(summaryQuery.data.completedStoryPoints) },
                      ],
                    },
                    {
                      title: "Delivery reliability",
                      rows: [
                        { label: "Hours logged", value: `${productivityQuery.data.hoursLogged}h` },
                        { label: "Tasks completed", value: String(productivityQuery.data.tasksCompleted) },
                        { label: "On-time completions", value: String(productivityQuery.data.onTimeCompletedTasks) },
                        { label: "Late completions", value: String(productivityQuery.data.lateCompletedTasks) },
                        { label: "On-time rate", value: `${Math.round(onTimeRate)}%` },
                      ],
                    },
                  ],
                });
              } finally {
                setExporting(null);
              }
            }}
            align="start"
          />
        ) : null}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {summaryQuery.data?.userName ?? "Employee"} Employee Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Detailed task counts, story points, and on-time delivery rate.
          </p>
        </div>
      </div>

      {((summaryQuery.error || productivityQuery.error || snapshotQuery.error) && !isForbidden) ? (
        <ErrorBanner
          error="Unable to load employee analytics data."
          onRetry={() => {
            void summaryQuery.refetch();
            void productivityQuery.refetch();
            void snapshotQuery.refetch();
          }}
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-border/60 bg-card/70 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="size-4" />
                  Employee Analytics
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  A focused workspace for workload, delivery reliability, friction, and personal tracking context.
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <MetricCard
                  icon={Users}
                  label="Workload stance"
                  value={healthyLoadLabel}
                  hint={`${summaryQuery.data?.openAssignedTasks ?? 0} open assigned tasks`}
                  tone={
                    healthyLoadLabel === "Healthy Load"
                      ? "success"
                      : healthyLoadLabel === "Watch"
                        ? "info"
                        : "warning"
                  }
                />
                <MetricCard
                  icon={CheckCircle2}
                  label="Delivery reliability"
                  value={`${Math.round(onTimeRate)}%`}
                  hint={`${productivityQuery.data?.onTimeCompletedTasks ?? 0} on-time completions`}
                  tone={onTimeRate >= 80 ? "success" : onTimeRate >= 55 ? "info" : "warning"}
                />
                <MetricCard
                  icon={AlertTriangle}
                  label="Recent friction"
                  value={lateCompleted}
                  hint="Late completed tasks"
                  tone={lateCompleted > 0 ? "warning" : "default"}
                />
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/70 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Personal tracking</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your time and activity history stay on the profile tracking view.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  Open the profile tracking area for worked-day history, activity timeline, and timesheet-style context.
                </div>
                {snapshotQuery.data ? (
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    Shared project visibility: {snapshotQuery.data.sharedProjectCount || "Self / executive scope"}
                  </div>
                ) : null}
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={userId === user.id ? "/dashboard/users/profile/me" : `/dashboard/users/profile/${userId}`}>
                    Open Personal Tracking
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                icon={FolderKanban}
                label="Assigned tasks"
                value={summaryQuery.data?.totalAssignedTasks ?? 0}
                tone="primary"
                loading={summaryLoading}
              />
              <MetricCard
                icon={Activity}
                label="Open assigned"
                value={summaryQuery.data?.openAssignedTasks ?? 0}
                tone="running"
                loading={summaryLoading}
              />
              <MetricCard
                icon={CheckCircle2}
                label="Completed assigned"
                value={summaryQuery.data?.completedAssignedTasks ?? 0}
                tone="success"
                loading={summaryLoading}
              />
              <MetricCard
                icon={Sigma}
                label="Story points (assigned)"
                value={summaryQuery.data?.totalStoryPointsAssigned ?? 0}
                tone="info"
                loading={summaryLoading}
              />
              <MetricCard
                icon={Trophy}
                label="Story points (completed)"
                value={summaryQuery.data?.completedStoryPoints ?? 0}
                tone="success"
                loading={summaryLoading}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Delivery reliability</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current completion quality and due-date discipline for this employee view.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                icon={TimerReset}
                label="Hours logged"
                value={`${productivityQuery.data?.hoursLogged ?? 0}h`}
                tone="info"
                loading={productivityLoading}
              />
              <MetricCard
                icon={CheckCircle2}
                label="Tasks completed"
                value={productivityQuery.data?.tasksCompleted ?? 0}
                tone="success"
                loading={productivityLoading}
              />
              <MetricCard
                icon={CalendarCheck2}
                label="On-time completions"
                value={productivityQuery.data?.onTimeCompletedTasks ?? 0}
                tone="success"
                loading={productivityLoading}
              />
              <MetricCard
                icon={AlertTriangle}
                label="Late completions"
                value={lateCompleted}
                tone={lateCompleted > 0 ? "destructive" : "default"}
                emphasize={lateCompleted > 0}
                loading={productivityLoading}
              />
              <MetricCard
                icon={Trophy}
                label="On-time rate"
                value={`${Math.round(onTimeRate)}%`}
                progress={onTimeRate}
                tone={onTimeRate >= 80 ? "success" : onTimeRate >= 50 ? "running" : "warning"}
                loading={productivityLoading}
              />
              <MetricCard
                icon={Activity}
                label="Tasks with due date"
                value={productivityQuery.data?.completedTasksWithDueDate ?? 0}
                tone="default"
                loading={productivityLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent friction and guidance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Lightweight coaching labels using the current analytics slice you already have access to.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Workload signal</p>
                  <Badge
                    variant="outline"
                    className={
                      healthyLoadLabel === "Healthy Load"
                        ? "pm-badge-risk-low border"
                        : healthyLoadLabel === "Watch"
                          ? "pm-badge-risk-medium border"
                          : "pm-badge-risk-high border"
                    }
                  >
                    {healthyLoadLabel}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {healthyLoadLabel === "Healthy Load"
                    ? "Current open work and on-time delivery look balanced."
                    : healthyLoadLabel === "Watch"
                      ? "Delivery is still manageable, but the current pace should be reviewed."
                      : "Open work and late completions suggest this contributor needs rebalancing support."}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">Suggested next step</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lateCompleted > 0
                    ? "Review due dates and break larger tasks into smaller commitments before the next sprint checkpoint."
                    : (summaryQuery.data?.openAssignedTasks ?? 0) > 5
                      ? "Check whether active assignments should be narrowed so completion rhythm stays strong."
                      : "Keep the current pace and use personal tracking to monitor consistency over the week."}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium">Project context</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This page is visible because of your own profile, executive scope, or a shared project context.
                </p>
              </div>
            </CardContent>
          </Card>
          </div>

          <Card className="border-border/60 bg-card/70 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle>Work history trends</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent completion rhythm, on-time consistency, and open-work pressure.
              </p>
            </CardHeader>
            <CardContent>
              {snapshotQuery.data ? (
                <ChartContainer
                  className="h-[300px] w-full"
                  config={{
                    completed: { label: "Completed", color: "var(--pm-project-completed-accent)" },
                    onTime: { label: "On Time", color: "var(--pm-project-running-accent)" },
                    workload: { label: "Open Work", color: "var(--pm-project-stopped-accent)" },
                  }}
                >
                  <AreaChart
                    data={snapshotQuery.data.completedTrend.map((point, index) => ({
                      label: point.label,
                      completed: point.value,
                      onTime: snapshotQuery.data!.onTimeTrend[index]?.value ?? 0,
                      workload: snapshotQuery.data!.workloadTrend[index]?.value ?? 0,
                    }))}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="var(--color-completed)"
                      fill="var(--color-completed)"
                      fillOpacity={0.18}
                      strokeWidth={2.4}
                    />
                    <Area
                      type="monotone"
                      dataKey="onTime"
                      stroke="var(--color-onTime)"
                      fill="var(--color-onTime)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="workload"
                      stroke="var(--color-workload)"
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : null}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
