"use client";

import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Download,
  Gauge,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { ExportMenuButton } from "@/components/export-menu-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useProjectPermissions from "@/modules/projects/hooks/permissions/use-project-permissions";
import { useProjectAnalyticsSnapshot } from "@/modules/projects/hooks/analytics/use-project-analytics-snapshot";
import { EmptyState } from "../../shared/empty-state";
import { MetricCard } from "../../shared/metric-card";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import { exportReportToPdfPrintWindow, exportRowsToCsv } from "@/lib/report-export";

interface ProjectAnalyticsDashboardProps {
  projectId: string;
}

function severityClass(severity: "LOW" | "MEDIUM" | "HIGH") {
  if (severity === "HIGH") return "pm-badge-risk-high border";
  if (severity === "MEDIUM") return "pm-badge-risk-medium border";
  return "pm-badge-risk-low border";
}

function healthToneClass(status: "HEALTHY" | "WATCH" | "AT_RISK") {
  if (status === "AT_RISK") return "pm-badge-risk-high border";
  if (status === "WATCH") return "pm-badge-risk-medium border";
  return "pm-badge-risk-low border";
}

function memberLoadTone(loadStatus: "HEALTHY" | "WATCH" | "OVERLOADED" | "UNDERUTILIZED") {
  if (loadStatus === "OVERLOADED") return "pm-badge-risk-high border";
  if (loadStatus === "WATCH") return "pm-badge-risk-medium border";
  if (loadStatus === "UNDERUTILIZED") return "pm-tone-info border";
  return "pm-badge-risk-low border";
}

function ProjectAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[360px] w-full" />
        <Skeleton className="h-[360px] w-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Skeleton className="h-[420px] w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    </div>
  );
}

function DeliveryTrendChart({
  data,
}: {
  data: { label: string; completedTasks: number; createdTasks: number; overdueOpenTasks: number }[];
}) {
  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Delivery trend</CardTitle>
        <p className="text-sm text-muted-foreground">
          Recent weekly movement between created work, completed work, and overdue pressure.
        </p>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer
            className="h-[280px] w-full"
            config={{
              completedTasks: {
                label: "Completed",
                color: "var(--pm-project-completed-accent)",
              },
              createdTasks: {
                label: "Created",
                color: "var(--pm-project-running-accent)",
              },
              overdueOpenTasks: {
                label: "Overdue",
                color: "var(--pm-project-stopped-accent)",
              },
            }}
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="deliveryCompleted" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-completedTasks)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="var(--color-completedTasks)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="deliveryCreated" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-createdTasks)" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="var(--color-createdTasks)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="createdTasks"
                stroke="var(--color-createdTasks)"
                fill="url(#deliveryCreated)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completedTasks"
                stroke="var(--color-completedTasks)"
                fill="url(#deliveryCompleted)"
                strokeWidth={2.4}
              />
              <Area
                type="monotone"
                dataKey="overdueOpenTasks"
                stroke="var(--color-overdueOpenTasks)"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 4"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <EmptyState
            icon={TrendingUp}
            message="No trend data yet"
            description="Project task history needs a bit more activity before the delivery trend becomes meaningful."
          />
        )}
      </CardContent>
    </Card>
  );
}

function MemberLoadChart({
  data,
}: {
  data: {
    name: string;
    committedPoints: number;
    capacityPoints: number;
    utilizationPercent: number;
  }[];
}) {
  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Team capacity pressure</CardTitle>
        <p className="text-sm text-muted-foreground">
          Committed points against planned capacity for the most pressured teammates.
        </p>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer
            className="h-[280px] w-full"
            config={{
              capacityPoints: {
                label: "Capacity",
                color: "var(--pm-project-running-accent)",
              },
              committedPoints: {
                label: "Committed",
                color: "var(--pm-project-completed-accent)",
              },
            }}
          >
            <BarChart data={data} barCategoryGap={18}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="capacityPoints"
                fill="var(--color-capacityPoints)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="committedPoints"
                fill="var(--color-committedPoints)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyState
            icon={Users}
            message="No capacity data yet"
            description="Active sprint planning data will populate the capacity comparison chart."
          />
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectAnalyticsDashboard({
  projectId,
}: ProjectAnalyticsDashboardProps) {
  const t = useTranslations("modules.projects.project.details");
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState<null | "csv" | "pdf">(null);
  const permissions = useProjectPermissions(projectId);
  const snapshotQuery = useProjectAnalyticsSnapshot(projectId);

  if (!permissions.canViewAnalytics) {
    return (
      <EmptyState
        message="Access Restricted"
        description="You don't have permission to view project analytics."
        icon={BarChart3}
      />
    );
  }

  const handleRefresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ["project-dashboard-snapshot", projectId],
    });
  };

  const headerMetrics = snapshotQuery.data
    ? [
        {
          key: "health",
          icon: Gauge,
          tone:
            snapshotQuery.data.health.status === "AT_RISK"
              ? ("warning" as const)
              : snapshotQuery.data.health.status === "WATCH"
                ? ("info" as const)
                : ("success" as const),
          value: snapshotQuery.data.health.score,
          label: "health score",
        },
        {
          key: "completion",
          icon: CheckCircle2,
          tone: "success" as const,
          value: `${Math.round(snapshotQuery.data.delivery.completionPercent)}%`,
          label: "complete",
        },
        {
          key: "capacity",
          icon: Users,
          tone:
            snapshotQuery.data.capacity.overloadedMembers > 0
              ? ("warning" as const)
              : ("info" as const),
          value: snapshotQuery.data.capacity.overloadedMembers,
          label: "overloaded members",
        },
        {
          key: "ai",
          icon: BrainCircuit,
          tone:
            snapshotQuery.data.ai.actions.some((action) => action.severity === "HIGH")
              ? ("warning" as const)
              : ("info" as const),
          value: snapshotQuery.data.ai.actions.length,
          label: "AI actions",
        },
      ]
    : [
        {
          key: "live",
          icon: CheckCircle2,
          tone: "success" as const,
          label: "Live backend data",
        },
      ];

  const headerStrip = (
    <PageHeaderStrip
      icon={BarChart3}
      title={t("analytics.title", { defaultValue: "Project Analytics" })}
      description={t("analytics.subtitle", {
        defaultValue:
          "One PM snapshot for delivery health, team capacity, and AI planning actions.",
      })}
      metrics={headerMetrics}
      actions={
        permissions.canViewAnalytics && snapshotQuery.data ? (
          <ExportMenuButton
            exporting={exporting}
            onExportCsv={() => {
              const snapshot = snapshotQuery.data;
              if (!snapshot) return;
              setExporting("csv");
              try {
                exportRowsToCsv(
                  `project-analytics-${projectId}-${new Date().toISOString().slice(0, 10)}.csv`,
                  [
                    { key: "metric", label: "Metric" },
                    { key: "value", label: "Value" },
                    { key: "notes", label: "Notes" },
                  ],
                  [
                    { metric: "Project", value: snapshot.projectName, notes: snapshot.projectType ?? "" },
                    { metric: "Health score", value: snapshot.health.score, notes: snapshot.health.status },
                    { metric: "Completion percent", value: `${Math.round(snapshot.delivery.completionPercent)}%`, notes: snapshot.delivery.summary },
                    { metric: "Completed tasks", value: snapshot.delivery.completedTasks, notes: `${snapshot.delivery.totalTasks} total tasks` },
                    { metric: "Overdue tasks", value: snapshot.delivery.overdueTasks, notes: "Delivery pressure" },
                    { metric: "Blocked tasks", value: snapshot.delivery.blockedTasks, notes: "Blocked work" },
                    { metric: "Overloaded members", value: snapshot.capacity.overloadedMembers, notes: `${snapshot.capacity.totalCommittedPoints}/${snapshot.capacity.totalCapacityPoints} pts` },
                    { metric: "AI actions", value: snapshot.ai.actions.length, notes: `${snapshot.ai.anomalies.length} anomalies` },
                  ],
                );
              } finally {
                setExporting(null);
              }
            }}
            onExportPdf={() => {
              const snapshot = snapshotQuery.data;
              if (!snapshot) return;
              setExporting("pdf");
              try {
                exportReportToPdfPrintWindow({
                  filename: `project-analytics-${projectId}-${new Date().toISOString().slice(0, 10)}.pdf`,
                  title: `${snapshot.projectName} Project Analytics`,
                  subtitle: snapshot.health.summary,
                  sections: [
                    {
                      title: "Delivery health",
                      rows: [
                        { label: "Health score", value: String(snapshot.health.score) },
                        { label: "Status", value: snapshot.health.status },
                        { label: "Completion", value: `${Math.round(snapshot.delivery.completionPercent)}%` },
                        { label: "Completed tasks", value: String(snapshot.delivery.completedTasks) },
                        { label: "Overdue tasks", value: String(snapshot.delivery.overdueTasks) },
                        { label: "Blocked tasks", value: String(snapshot.delivery.blockedTasks) },
                      ],
                    },
                    {
                      title: "Capacity and AI",
                      rows: [
                        { label: "Overloaded members", value: String(snapshot.capacity.overloadedMembers) },
                        { label: "Underutilized members", value: String(snapshot.capacity.underutilizedMembers) },
                        { label: "Estimate quality", value: snapshot.ai.estimateQuality.qualityStatus },
                        { label: "AI actions", value: String(snapshot.ai.actions.length) },
                        { label: "AI anomalies", value: String(snapshot.ai.anomalies.length) },
                      ],
                    },
                  ],
                });
              } finally {
                setExporting(null);
              }
            }}
            className="gap-1.5"
          />
        ) : null
      }
    />
  );

  if (snapshotQuery.isLoading) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <ProjectAnalyticsSkeleton />
      </div>
    );
  }

  if (snapshotQuery.error || !snapshotQuery.data) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <ErrorBanner
          error="Unable to load the project analytics snapshot."
          onRetry={() => void snapshotQuery.refetch()}
        />
      </div>
    );
  }

  const snapshot = snapshotQuery.data;
  const heroTone = healthToneClass(snapshot.health.status);
  const deliveryDistribution = [
    {
      key: "completed",
      label: "Completed",
      value: snapshot.delivery.completedTasks,
      color: "var(--pm-project-completed-accent)",
    },
    {
      key: "open",
      label: "Open",
      value: Math.max(
        snapshot.delivery.openTasks -
          snapshot.delivery.overdueTasks -
          snapshot.delivery.blockedTasks,
        0,
      ),
      color: "var(--pm-project-running-accent)",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: snapshot.delivery.overdueTasks,
      color: "var(--pm-project-stopped-accent)",
    },
    {
      key: "blocked",
      label: "Blocked",
      value: snapshot.delivery.blockedTasks,
      color: "var(--pm-tone-info-fg)",
    },
  ].filter((item) => item.value > 0);

  const memberLoadChartData = snapshot.capacity.rankedMembers.slice(0, 6).map((member) => ({
    name: member.name.split(" ")[0],
    committedPoints: member.committedPoints,
    capacityPoints: member.capacityPoints,
    utilizationPercent: member.utilizationPercent,
  }));

  const topActions = snapshot.ai.actions.slice(0, 4);
  const topAnomalies = snapshot.ai.anomalies.slice(0, 5);

  return (
    <div className="space-y-4">
      {headerStrip}

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={snapshotQuery.isFetching}
          className="gap-1.5"
        >
          {snapshotQuery.isFetching ? (
            <Spinner className="size-4" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh snapshot
        </Button>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
        <CardContent className="relative p-0">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--pm-project-running-accent) 11%, transparent) 0%, transparent 50%, color-mix(in srgb, var(--pm-project-completed-accent) 9%, transparent) 100%)",
            }}
          />
          <div className="relative grid gap-5 p-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={heroTone}>
                      {snapshot.health.status.replace("_", " ")}
                    </Badge>
                    {snapshot.businessUnit ? (
                      <Badge variant="outline" className="pm-tone-info">
                        {snapshot.businessUnit}
                      </Badge>
                    ) : null}
                    {snapshot.projectType ? (
                      <Badge variant="outline" className="pm-tone-info">
                        {snapshot.projectType}
                      </Badge>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">
                      {snapshot.projectName} PM command center
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      {snapshot.health.summary}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/85 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Project health
                  </p>
                  <p className="mt-1 text-4xl font-semibold">{snapshot.health.score}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[color:var(--pm-project-completed-accent)]/20 bg-background/88 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Delivery
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {Math.round(snapshot.delivery.completionPercent)}%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {snapshot.delivery.completedTasks}/{snapshot.delivery.totalTasks} tasks completed
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--pm-project-running-accent)]/20 bg-background/88 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Team capacity
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {snapshot.capacity.totalCommittedPoints}/
                    {snapshot.capacity.totalCapacityPoints}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {snapshot.capacity.overloadedMembers} overloaded,{" "}
                    {snapshot.capacity.underutilizedMembers} underutilized
                  </p>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-background/88 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    AI copilot
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {snapshot.ai.actions.length}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {snapshot.ai.anomalies.length} anomaly signals detected
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/12 bg-background/88 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  What changed
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {snapshot.delivery.summary}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-primary/12 bg-background/90 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Target className="size-4 text-primary" />
                  <p className="text-sm font-medium">Health drivers</p>
                </div>
                <div className="space-y-2">
                  {snapshot.health.drivers.slice(0, 4).map((driver) => (
                    <div
                      key={driver.key}
                      className="rounded-xl border border-primary/10 bg-muted/15 px-3 py-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{driver.label}</p>
                        <span className="text-xs font-semibold text-primary/80">
                          {driver.impact > 0 ? "+" : ""}
                          {driver.impact}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {driver.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-primary/12 bg-background/90 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <p className="text-sm font-medium">Operational cues</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/15 px-3 py-2 shadow-sm">
                    <span>Active sprint</span>
                    <span className="font-medium text-foreground">
                      {snapshot.delivery.activeSprintLabel ?? "No active sprint"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/15 px-3 py-2 shadow-sm">
                    <span>Milestone pressure</span>
                    <span className="font-medium text-foreground">
                      {snapshot.delivery.milestonePressureLabel ?? "Stable"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/15 px-3 py-2 shadow-sm">
                    <span>Estimate quality</span>
                    <span className="font-medium text-foreground">
                      {snapshot.ai.estimateQuality.qualityStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CheckCircle2}
          label="Completed work"
          value={snapshot.delivery.completedTasks}
          hint={`${snapshot.delivery.totalTasks} tracked tasks`}
          tone="success"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Pressure"
          value={`${snapshot.delivery.overdueTasks + snapshot.delivery.blockedTasks}`}
          hint={`${snapshot.delivery.overdueTasks} overdue | ${snapshot.delivery.blockedTasks} blocked`}
          tone={
            snapshot.delivery.overdueTasks + snapshot.delivery.blockedTasks > 0
              ? "warning"
              : "default"
          }
        />
        <MetricCard
          icon={Users}
          label="Capacity risk"
          value={snapshot.capacity.overloadedMembers}
          hint={`${snapshot.capacity.activeSprints} active sprints`}
          tone={snapshot.capacity.overloadedMembers > 0 ? "warning" : "info"}
        />
        <MetricCard
          icon={BrainCircuit}
          label="Estimate quality"
          value={`${Math.round(snapshot.ai.estimateQuality.onEstimateRatePercent)}%`}
          hint={`${snapshot.ai.estimateQuality.estimateMaeHours.toFixed(1)}h MAE`}
          tone={
            snapshot.ai.estimateQuality.qualityStatus === "STRONG"
              ? "success"
              : snapshot.ai.estimateQuality.qualityStatus === "WATCH"
                ? "info"
                : "warning"
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DeliveryTrendChart data={snapshot.trends.delivery} />
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Delivery snapshot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Project-wide distribution of completed, open, overdue, and blocked work.
            </p>
          </CardHeader>
          <CardContent>
            {deliveryDistribution.length ? (
              <ChartContainer
                className="h-[280px] w-full"
                config={Object.fromEntries(
                  deliveryDistribution.map((item) => [
                    item.key,
                    { label: item.label, color: item.color },
                  ]),
                )}
              >
                <BarChart data={deliveryDistribution}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {deliveryDistribution.map((item) => (
                      <Cell key={item.key} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyState
                icon={BarChart3}
                message="No delivery distribution yet"
                description="This project needs tracked task activity before the delivery split becomes useful."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="space-y-4">
          <MemberLoadChart data={memberLoadChartData} />

          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Team capacity ranking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Highest-pressure teammates first so you can see who needs help next.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.capacity.rankedMembers.length ? (
                snapshot.capacity.rankedMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="rounded-2xl border border-border/60 bg-background/75 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {member.openTasks} open | {member.overdueTasks} overdue |{" "}
                          {member.assignedTasks} assigned
                        </p>
                      </div>
                      <Badge variant="outline" className={memberLoadTone(member.loadStatus)}>
                        {member.loadStatus.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-muted/20 px-3 py-2 text-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Utilization
                        </p>
                        <p className="mt-1 font-semibold">
                          {Math.round(member.utilizationPercent)}%
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/20 px-3 py-2 text-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Load
                        </p>
                        <p className="mt-1 font-semibold">
                          {member.committedPoints}/{member.capacityPoints} pts
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/20 px-3 py-2 text-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Share
                        </p>
                        <p className="mt-1 font-semibold">
                          {Math.round(member.workloadSharePercent)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Users}
                  message="No member load data yet"
                  description="Once tasks and sprint commitments are assigned, the ranked capacity lane will appear here."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">AI Copilot actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Decision-focused AI interventions instead of raw technical anomaly text.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {topActions.length ? (
                topActions.map((action, index) => (
                  <div
                    key={`${action.code}-${action.targetType ?? "none"}-${action.targetId ?? action.ownerUserId ?? index}`}
                    className="rounded-2xl border border-border/60 bg-background/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.message}
                        </p>
                      </div>
                      <Badge variant="outline" className={severityClass(action.severity)}>
                        {action.severity}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-xl bg-muted/20 px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Why now
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{action.why}</p>
                      </div>
                      <div className="rounded-xl bg-muted/20 px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Recommended action
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {action.recommendedAction}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={BrainCircuit}
                  message="No AI actions yet"
                  description="The latest planning snapshot did not return any recommended intervention."
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">AI anomaly lane</CardTitle>
              <p className="text-sm text-muted-foreground">
                Raw signals are still available, but they are now easier to interpret and act on.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {topAnomalies.length ? (
                topAnomalies.map((anomaly, index) => (
                  <div
                    key={`${anomaly.code}-${index}`}
                    className="rounded-2xl border border-border/60 bg-background/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {anomaly.title ?? anomaly.code.replaceAll("_", " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {anomaly.message}
                        </p>
                      </div>
                      <Badge variant="outline" className={severityClass(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                    </div>
                    {anomaly.recommendedAction ? (
                      <div className="mt-3 rounded-xl bg-muted/20 px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Suggested next step
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {anomaly.recommendedAction}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={AlertTriangle}
                  message="No anomaly signals"
                  description="The latest AI anomaly scan did not detect blockers or delivery pressure."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProjectAnalyticsDashboard;
