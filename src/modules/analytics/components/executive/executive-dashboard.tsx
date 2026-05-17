"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Filter,
  FolderKanban,
  ListTodo,
  RefreshCw,
  Target,
  TimerReset,
  Trophy,
  Users,
} from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { ErrorBanner } from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import {
  useEmployeeAnalyticsSummary,
  useEmployeeProductivityMetrics,
  useExecutiveAnalyticsOverview,
} from "@/modules/analytics/hooks/use-analytics";
import fetchProjectStatusCounts from "@/modules/projects/services/api/project-status-counts";

import { MetricCard } from "@/modules/projects/components/shared/metric-card";
import { FilterPanel } from "@/modules/projects/components/shared/filter-panel";
import { FilterSection } from "@/modules/projects/components/shared/filter-section";

import { StatusDonutChart, MetricComparisonChart } from "./analytics-charts";

export default function ExecutiveDashboard() {
  const t = useTranslations("modules.analytics"); // Assuming you have translations for analytics
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const overviewQuery = useExecutiveAnalyticsOverview();
  const summaryQuery = useEmployeeAnalyticsSummary(user?.id);
  const productivityQuery = useEmployeeProductivityMetrics(user?.id);
  
  const statusCountsQuery = useQuery({
    queryKey: ["projects-status-counts-executive"],
    queryFn: () => fetchProjectStatusCounts({ isArchived: false }),
    refetchOnWindowFocus: false,
  });

  const isFetching =
    overviewQuery.isFetching ||
    summaryQuery.isFetching ||
    productivityQuery.isFetching ||
    statusCountsQuery.isFetching;

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
    void queryClient.invalidateQueries({ queryKey: ["analytics-employee-summary"] });
    void queryClient.invalidateQueries({ queryKey: ["analytics-employee-productivity"] });
    void queryClient.invalidateQueries({ queryKey: ["projects-status-counts-executive"] });
  };

  if (overviewQuery.error || summaryQuery.error || productivityQuery.error) {
    return (
      <ErrorBanner
        error="Unable to load executive analytics."
        onRetry={handleRefresh}
      />
    );
  }

  const overview = overviewQuery.data;
  const summary = summaryQuery.data;
  const productivity = productivityQuery.data;
  const statusCounts = statusCountsQuery.data;

  const isLoading = overviewQuery.isLoading || summaryQuery.isLoading || productivityQuery.isLoading;

  const completionRate =
    overview && overview.totalTasks > 0
      ? Math.round(((overview.completedTasks ?? 0) / overview.totalTasks) * 100)
      : 0;

  const projectDistribution = statusCounts
    ? [
        { key: "running", label: "Running", value: statusCounts.Running, color: "var(--pm-project-running-accent)" },
        { key: "pending", label: "Pending", value: statusCounts.Pending, color: "var(--pm-project-pending-accent)" },
        { key: "stopped", label: "Stopped", value: statusCounts.Stopped, color: "var(--pm-project-stopped-accent)" },
        { key: "completed", label: "Completed", value: statusCounts.Completed, color: "var(--pm-project-completed-accent)" },
      ].filter(d => d.value > 0)
    : [];

  const taskDistribution = overview
    ? [
        { key: "completed", label: "Completed", value: overview.completedTasks, color: "var(--pm-tone-success-fg)" },
        { key: "open", label: "Open", value: overview.openTasks, color: "var(--pm-tone-running-fg)" },
      ].filter(d => d.value > 0)
    : [];

  const productivityComparison = summary
    ? [
        {
          label: "Story Points",
          actual: summary.completedStoryPoints,
          target: summary.totalStoryPointsAssigned,
        },
        {
          label: "Tasks",
          actual: summary.completedAssignedTasks,
          target: summary.totalAssignedTasks,
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Skeleton className="h-[400px]" />
          <div className="space-y-4">
            <Skeleton className="h-[200px]" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[300px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isFetching}
          className="gap-1.5"
        >
          {isFetching ? <Spinner className="size-4" /> : <RefreshCw className="size-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left Sidebar / Filters */}
        <aside className="space-y-6 xl:sticky xl:top-4 h-fit">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="size-4" />
                Snapshot filters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <FilterPanel hasActiveFilters={false} onClear={() => {}}>
                <FilterSection label="Workspace scope">
                  <div className="rounded-xl border border-border/60 bg-muted/15 p-3 text-sm text-muted-foreground leading-relaxed">
                    This view aggregates all projects and tasks across your accessible business units.
                  </div>
                </FilterSection>

                <FilterSection label="Quick insights">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5 bg-background/50">
                      <div className="flex items-center gap-2">
                        <Activity className="size-3.5 text-orange-500" />
                        <span className="text-xs font-medium">Active Sprints</span>
                      </div>
                      <span className="text-xs font-bold">{overview?.activeSprints ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5 bg-background/50">
                      <div className="flex items-center gap-2">
                        <Users className="size-3.5 text-blue-500" />
                        <span className="text-xs font-medium">Resources</span>
                      </div>
                      <span className="text-xs font-bold">{overview?.totalProjectMembers ?? 0}</span>
                    </div>
                  </div>
                </FilterSection>
              </FilterPanel>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user?.name?.[0] ?? "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{user?.name ?? "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2 h-9 text-xs">
                <Link href={`/dashboard/analytics/employees/${user?.id}`}>
                  <Activity className="size-3.5" />
                  Open My Employee Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card/70 px-5 py-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Executive Analytics
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Portfolio-wide delivery, sprint, project, and staffing signals across your accessible business units.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Your Productivity
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  A personal employee-analytics slice for the current signed-in executive, shown separately for clarity.
                </p>
              </div>
            </div>
          </div>

          {/* Hero Snapshot */}
          <Card className="overflow-hidden border-border/60 bg-card/70 backdrop-blur-md shadow-lg group relative transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30">
            <div
              className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60"
              style={{
                background: "linear-gradient(135deg, color-mix(in srgb, var(--pm-tone-info-fg) 15%, transparent) 0%, transparent 50%, color-mix(in srgb, var(--pm-tone-success-fg) 12%, transparent) 100%)",
              }}
            />
            <CardContent className="relative p-0">
              <div className="grid gap-6 p-8 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Badge variant="outline" className="pm-tone-running font-medium shadow-sm">{t("hero.momentum")}</Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("hero.title")}</h2>
                    <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                      {t("hero.description", { tasks: overview?.totalTasks ?? 0, projects: overview?.totalProjects ?? 0 })}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/50 bg-background/60 p-5 backdrop-blur-sm transition-all hover:bg-background/80 hover:shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("hero.completion")}</p>
                      <p className="mt-1 text-3xl font-bold">{completionRate}%</p>
                      <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${completionRate}%` }} />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-background/60 p-5 backdrop-blur-sm transition-all hover:bg-background/80 hover:shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("hero.velocity")}</p>
                      <p className="mt-1 text-3xl font-bold">{overview?.activeSprints ?? 0}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 font-medium">Parallel active sprints</p>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-background/60 p-5 backdrop-blur-sm transition-all hover:bg-background/80 hover:shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("hero.atRisk")}</p>
                      <p className="mt-1 text-3xl font-bold text-destructive">{(statusCounts?.Stopped ?? 0)}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 font-medium">Stopped projects</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/50 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="size-4 text-primary" />
                      <p className="text-sm font-bold tracking-tight">Organization Health</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">On-time Completion</span>
                        <span className="text-foreground font-bold">{productivity?.onTimeRatePercent?.toFixed(0) ?? 0}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Member Capacity</span>
                        <span className="text-foreground font-bold">Optimal</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Delivery Confidence</span>
                        <span className="text-foreground font-bold">High</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{t("hero.insight.title")}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("hero.insight.message", { rate: completionRate, stopped: statusCounts?.Stopped ?? 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visualization Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <StatusDonutChart
              title={t("charts.projectDistribution.title")}
              description={t("charts.projectDistribution.description")}
              data={projectDistribution}
              totalLabel="Projects"
            />
            <StatusDonutChart
              title={t("charts.taskStatus.title")}
              description={t("charts.taskStatus.description")}
              data={taskDistribution}
              totalLabel="Tasks"
            />
          </div>

          {/* Productivity Section */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Your Productivity
            </p>
            <h3 className="text-lg font-semibold tracking-tight">
              Personal delivery metrics
            </h3>
            <p className="text-sm text-muted-foreground">
              This section reflects your own employee analytics, separate from the executive portfolio totals above.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
             <MetricComparisonChart
              title={t("charts.efficiency.title")}
              description={t("charts.efficiency.description")}
              data={productivityComparison}
              actualLabel="Completed"
              targetLabel="Assigned"
            />

            <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("productivity.title")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("productivity.description")}</p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  icon={TimerReset}
                  label={t("productivity.hoursLogged")}
                  value={`${productivity?.hoursLogged ?? 0}h`}
                  tone="info"
                  density="compact"
                />
                <MetricCard
                  icon={Trophy}
                  label={t("productivity.onTimeRate")}
                  value={`${Math.round(productivity?.onTimeRatePercent ?? 0)}%`}
                  progress={productivity?.onTimeRatePercent ?? 0}
                  tone={ (productivity?.onTimeRatePercent ?? 0) >= 80 ? "success" : "warning"}
                  density="compact"
                />
                <MetricCard
                  icon={CalendarCheck2}
                  label={t("productivity.onTimeTasks")}
                  value={productivity?.onTimeCompletedTasks ?? 0}
                  tone="success"
                  density="compact"
                />
                <MetricCard
                  icon={AlertTriangle}
                  label={t("productivity.lateTasks")}
                  value={productivity?.lateCompletedTasks ?? 0}
                  tone={ (productivity?.lateCompletedTasks ?? 0) > 0 ? "destructive" : "default"}
                  emphasize={ (productivity?.lateCompletedTasks ?? 0) > 0}
                  density="compact"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
