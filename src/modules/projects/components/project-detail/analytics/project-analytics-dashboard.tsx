"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchProjectCapacity } from "@/modules/projects/services/api/project-capacity";
import { fetchProjectAiInsights } from "@/modules/projects/services/api/project-ai-insights";
import {
  fetchProjectProductivityMetrics,
  fetchProjectReportOverview,
  fetchProjectTeamWorkload,
} from "@/modules/projects/services/api/project-report";
import { EmptyState } from "../../shared/empty-state";
import useProjectPermissions from "@/modules/projects/hooks/permissions/use-project-permissions";
import {
  FilterMenu,
  type FilterMenuCategory,
} from "../../shared/filter-menu";
import { MetricCard } from "../../shared/metric-card";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import {
  Toolbar,
  type ToolbarFilterChip,
} from "../../shared/toolbar";
import ProjectCapacityView from "./project-capacity-view";
import ProjectProductivityMetrics from "./project-productivity-metrics";
import StatusDonutChart from "./status-donut-chart";
import TeamPerformanceChart from "./team-performance-chart";

interface ProjectAnalyticsDashboardProps {
  projectId: string;
}

type MemberScope = "all" | "focused" | "overloaded";

function getSeverityClass(severity: "LOW" | "MEDIUM" | "HIGH") {
  if (severity === "HIGH") return "pm-badge-risk-high border";
  if (severity === "MEDIUM") return "pm-badge-risk-medium border";
  return "pm-badge-risk-low border";
}

function getHealthTone(
  overdueTasks: number,
  stuckTasks: number,
  riskLevel: "LOW" | "MEDIUM" | "HIGH",
) {
  if (riskLevel === "HIGH" || overdueTasks > 0 || stuckTasks > 1) {
    return "pm-badge-risk-high border";
  }
  if (riskLevel === "MEDIUM" || stuckTasks > 0) {
    return "pm-badge-risk-medium border";
  }
  return "pm-badge-risk-low border";
}

function getMemberScopeLabel(scope: MemberScope) {
  if (scope === "focused") return "Open work";
  if (scope === "overloaded") return "Over capacity";
  return "All members";
}

function resolveAnomalyGuidance(
  code: string,
  recommendations: string[],
): string {
  const normalized = code.toUpperCase();

  if (normalized === "ASSIGNEE_OVERLOAD") {
    return (
      recommendations.find((item) => item.toLowerCase().includes("overloaded")) ??
      "Rebalance assignments before the next commitment cycle."
    );
  }

  if (normalized === "BLOCKED_TASK") {
    return (
      recommendations.find((item) => item.toLowerCase().includes("blocked")) ??
      "Prioritize dependency resolution and unblock the chain."
    );
  }

  if (normalized === "OVERDUE_TASK") {
    return (
      recommendations.find((item) => item.toLowerCase().includes("scope")) ??
      recommendations.find((item) => item.toLowerCase().includes("estimate")) ??
      "Review task scope and delivery dates with the owner."
    );
  }

  return recommendations[0] ?? "Review this signal with the project team.";
}

function ProjectAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-56 w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.45fr]">
        <Skeleton className="h-[380px] w-full" />
        <Skeleton className="h-[380px] w-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-[360px] w-full" />
        <Skeleton className="h-[360px] w-full" />
      </div>
    </div>
  );
}

export function ProjectAnalyticsDashboard({
  projectId,
}: ProjectAnalyticsDashboardProps) {
  const t = useTranslations("modules.projects.project.details");
  const queryClient = useQueryClient();
  const permissions = useProjectPermissions(projectId);

  // Restrict analytics access based on permissions
  if (!permissions.canViewAnalytics) {
    return (
      <EmptyState
        message="Access Restricted"
        description="You don't have permission to view project analytics."
        icon={BarChart3}
      />
    );
  }
  const [memberSearch, setMemberSearch] = useState("");
  const [memberScope, setMemberScope] = useState<MemberScope>("all");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [membersInitialized, setMembersInitialized] = useState(false);

  const reportQuery = useQuery({
    queryKey: ["project-report-overview", projectId],
    queryFn: () => fetchProjectReportOverview(projectId),
    enabled: !!projectId,
  });
  const productivityQuery = useQuery({
    queryKey: ["project-productivity-metrics", projectId],
    queryFn: () => fetchProjectProductivityMetrics(projectId),
    enabled: !!projectId,
  });
  const workloadQuery = useQuery({
    queryKey: ["project-team-workload", projectId],
    queryFn: () => fetchProjectTeamWorkload(projectId),
    enabled: !!projectId,
  });
  const capacityQuery = useQuery({
    queryKey: ["project-capacity", projectId],
    queryFn: () => fetchProjectCapacity(projectId),
    enabled: !!projectId,
  });
  const aiInsightsQuery = useQuery({
    queryKey: ["project-ai-insights", projectId],
    queryFn: () => fetchProjectAiInsights(projectId),
    enabled: !!projectId,
  });

  const isFetching =
    reportQuery.isFetching ||
    productivityQuery.isFetching ||
    workloadQuery.isFetching ||
    capacityQuery.isFetching ||
    aiInsightsQuery.isFetching;

  const headerMetrics =
    reportQuery.data && capacityQuery.data && aiInsightsQuery.data
      ? [
          {
            key: "live",
            icon: CheckCircle2,
            tone: "success" as const,
            label: "Live backend data",
          },
          {
            key: "completion",
            icon: Target,
            tone: "running" as const,
            value: `${Math.round(reportQuery.data.completionPercent)}%`,
            label: "complete",
          },
          {
            key: "sprints",
            icon: Sparkles,
            tone: "info" as const,
            value: capacityQuery.data.activeSprints,
            label: "active sprints",
          },
          {
            key: "signals",
            icon: AlertTriangle,
            tone:
              aiInsightsQuery.data.anomalies.length > 0
                ? ("warning" as const)
                : ("info" as const),
            value: aiInsightsQuery.data.anomalies.length,
            label: "AI signals",
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
          "Track delivery health, team execution, and AI planning signals in one view.",
      })}
      metrics={headerMetrics}
    />
  );

  const allMembers = useMemo(
    () =>
      (workloadQuery.data?.members ?? [])
        .map((member) => {
          const capacityMember = (capacityQuery.data?.members ?? []).find(
            (entry) => entry.userId === member.userId,
          );

          return {
            ...member,
            utilizationPercent: capacityMember?.utilizationPercent ?? 0,
            committedPoints: capacityMember?.committedPoints ?? 0,
            capacityPoints: capacityMember?.capacityPoints ?? 0,
            isOverCapacity: capacityMember?.isOverCapacity ?? false,
          };
        })
        .sort((a, b) => b.workloadSharePercent - a.workloadSharePercent),
    [capacityQuery.data?.members, workloadQuery.data?.members],
  );

  useEffect(() => {
    if (allMembers.length > 0 && !membersInitialized) {
      setSelectedMemberIds(allMembers.map((member) => member.userId));
      setMembersInitialized(true);
    }
  }, [allMembers, membersInitialized]);

  const handleRefresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ["project-report-overview", projectId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["project-productivity-metrics", projectId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["project-team-workload", projectId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["project-capacity", projectId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["project-ai-insights", projectId],
    });
  };

  if (
    reportQuery.isLoading ||
    productivityQuery.isLoading ||
    workloadQuery.isLoading ||
    capacityQuery.isLoading ||
    aiInsightsQuery.isLoading
  ) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <ProjectAnalyticsSkeleton />
      </div>
    );
  }

  if (
    reportQuery.error ||
    productivityQuery.error ||
    workloadQuery.error ||
    capacityQuery.error ||
    aiInsightsQuery.error
  ) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <ErrorBanner
          error={t("analytics.loadError", {
            defaultValue: "Unable to load project analytics.",
          })}
          onRetry={() => {
            void reportQuery.refetch();
            void productivityQuery.refetch();
            void workloadQuery.refetch();
            void capacityQuery.refetch();
            void aiInsightsQuery.refetch();
          }}
        />
      </div>
    );
  }

  if (
    !reportQuery.data ||
    !productivityQuery.data ||
    !workloadQuery.data ||
    !capacityQuery.data ||
    !aiInsightsQuery.data
  ) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <EmptyState
          icon={BarChart3}
          message={t("analytics.emptyTitle", {
            defaultValue: "No analytics available",
          })}
          description={t("analytics.emptyDescription", {
            defaultValue: "This project does not have enough tracked data yet.",
          })}
        />
      </div>
    );
  }

  const report = reportQuery.data;
  const productivity = productivityQuery.data;
  const workload = workloadQuery.data;
  const capacity = capacityQuery.data;
  const aiInsights = aiInsightsQuery.data;

  const effectiveSelectedMemberIds =
    selectedMemberIds.length === 0 && !membersInitialized
      ? allMembers.map((member) => member.userId)
      : selectedMemberIds;

  const filteredMembers = allMembers.filter((member) => {
    const matchesSearch =
      memberSearch.trim().length === 0 ||
      member.name.toLowerCase().includes(memberSearch.trim().toLowerCase());
    const matchesScope =
      memberScope === "all" ||
      (memberScope === "focused" && member.openTasks > 0) ||
      (memberScope === "overloaded" && member.isOverCapacity);
    const matchesSelection = effectiveSelectedMemberIds.includes(member.userId);

    return matchesSearch && matchesScope && matchesSelection;
  });

  const filteredMemberIds = new Set(filteredMembers.map((member) => member.userId));
  const filteredCapacityMembers = capacity.members.filter((member) =>
    filteredMemberIds.has(member.userId),
  );
  const filteredProductivityMembers = productivity.members.filter((member) =>
    filteredMemberIds.has(member.userId),
  );

  const allMembersSelected =
    allMembers.length > 0 &&
    effectiveSelectedMemberIds.length === allMembers.length;
  const visibleMembersCount = filteredMembers.length;
  const visibleAssignedTasks = filteredMembers.reduce(
    (sum, member) => sum + member.assignedTasks,
    0,
  );
  const visibleOpenTasks = filteredMembers.reduce(
    (sum, member) => sum + member.openTasks,
    0,
  );
  const visibleOverdueTasks = filteredMembers.reduce(
    (sum, member) => sum + member.overdueTasks,
    0,
  );
  const visibleLoggedHours = filteredMembers.reduce(
    (sum, member) => sum + member.loggedHours,
    0,
  );
  const visibleCommittedPoints = filteredCapacityMembers.reduce(
    (sum, member) => sum + member.committedPoints,
    0,
  );
  const visibleCapacityPoints = filteredCapacityMembers.reduce(
    (sum, member) => sum + member.capacityPoints,
    0,
  );
  const visibleAverageProductivity =
    filteredProductivityMembers.length > 0
      ? filteredProductivityMembers.reduce(
          (sum, member) => sum + member.productivityScore,
          0,
        ) / filteredProductivityMembers.length
      : 0;
  const visibleOverloadedMembers = filteredCapacityMembers.filter(
    (member) => member.isOverCapacity,
  ).length;

  const handleClearFilters = () => {
    setMemberScope("all");
    setSelectedMemberIds(allMembers.map((member) => member.userId));
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds((current) => {
      const base =
        current.length === 0 && !membersInitialized
          ? allMembers.map((member) => member.userId)
          : current;

      if (base.includes(memberId)) {
        return base.filter((value) => value !== memberId);
      }

      return [...base, memberId];
    });
    setMembersInitialized(true);
  };

  const filterCategories: FilterMenuCategory[] = [
    {
      id: "scope",
      label: "Member scope",
      icon: Target,
      multiple: false,
      selectedIds: [memberScope],
      onClear: () => setMemberScope("all"),
      onToggle: (id) => setMemberScope(id as MemberScope),
      options: [
        { id: "all", label: "All members" },
        { id: "focused", label: "Members with open work" },
        { id: "overloaded", label: "Members over capacity" },
      ],
    },
    {
      id: "members",
      label: "Team members",
      icon: Users,
      multiple: true,
      selectedIds: effectiveSelectedMemberIds,
      onClear: () => setSelectedMemberIds(allMembers.map((member) => member.userId)),
      onToggle: toggleMemberSelection,
      options: allMembers.map((member) => ({
        id: member.userId,
        label: member.name,
        count: member.openTasks,
        description: `${member.assignedTasks} assigned tasks`,
      })),
    },
  ];

  const activeFilters: ToolbarFilterChip[] = (() => {
    const chips: ToolbarFilterChip[] = [];

    if (memberScope !== "all") {
      chips.push({
        id: "member-scope",
        prefix: "Scope:",
        label: getMemberScopeLabel(memberScope),
        onRemove: () => setMemberScope("all"),
      });
    }

    if (!allMembersSelected && effectiveSelectedMemberIds.length > 0) {
      chips.push({
        id: "selected-members",
        prefix: "Members:",
        label: `${effectiveSelectedMemberIds.length} selected`,
        onRemove: () =>
          setSelectedMemberIds(allMembers.map((member) => member.userId)),
      });
    }

    return chips;
  })();

  const activeFilterCount = activeFilters.length;

  const activeTasks = Math.max(
    report.openTasks - report.overdueTasks - report.stuckTasks,
    0,
  );
  const deliveryBreakdown = [
    {
      key: "completed",
      label: "Completed",
      value: report.completedTasks,
      color: "var(--pm-project-completed-accent)",
    },
    {
      key: "active",
      label: "Active",
      value: activeTasks,
      color: "var(--pm-project-running-accent)",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: report.overdueTasks,
      color: "var(--pm-project-stopped-accent)",
    },
    {
      key: "stuck",
      label: "Stuck",
      value: report.stuckTasks,
      color: "var(--pm-tone-info-fg)",
    },
  ].filter((item) => item.value > 0);

  const performanceData = filteredCapacityMembers
    .slice()
    .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
    .slice(0, 8)
    .map((member) => ({
      name: member.name,
      planned: member.capacityPoints,
      actual: member.committedPoints,
    }));

  const issueRows = aiInsights.anomalies.map((anomaly, index) => ({
    key: `${anomaly.code}-${index}`,
    issue: anomaly.message,
    source: anomaly.code.replaceAll("_", " "),
    severity: anomaly.severity,
    guidance: resolveAnomalyGuidance(anomaly.code, aiInsights.recommendations),
  }));

  const heroToneClass = getHealthTone(
    report.overdueTasks,
    report.stuckTasks,
    capacity.riskLevel,
  );

  return (
    <div className="space-y-4">
      {headerStrip}

      <Toolbar
        search={memberSearch}
        onSearchChange={setMemberSearch}
        searchPlaceholder="Search teammates"
        filterContent={
          <FilterMenu
            categories={filterCategories}
            footer={
              <p className="text-xs leading-relaxed text-muted-foreground">
                Filters change the team-slice cards and charts below. Project
                delivery and AI anomaly totals remain project-wide.
              </p>
            }
          />
        }
        activeFilterCount={activeFilterCount}
        activeFilters={activeFilters}
        onClearAllFilters={
          activeFilterCount > 0 ? handleClearFilters : undefined
        }
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            className="gap-1.5"
          >
            {isFetching ? (
              <Spinner className="size-4" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {t("analytics.refresh", { defaultValue: "Refresh" })}
          </Button>
        }
        className="rounded-xl border bg-card px-4"
        sticky={false}
      />

      <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
        <CardContent className="relative p-0">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--pm-project-running-accent) 10%, transparent) 0%, transparent 45%, color-mix(in srgb, var(--pm-project-completed-accent) 9%, transparent) 100%)",
            }}
          />
          <div className="relative grid gap-5 p-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <Badge variant="outline" className={heroToneClass}>
                    Project-wide delivery health
                  </Badge>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">
                      Delivery status and planning confidence
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      The summary below is project-wide. Team filters only affect
                      the focused workload slice and capacity charts underneath.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Completion
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    {Math.round(report.completionPercent)}%
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Open work
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{report.openTasks}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {report.overdueTasks} overdue and {report.stuckTasks} stale
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Sprint load
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {capacity.totalCommittedPoints}/{capacity.totalCapacityPoints}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Across {capacity.activeSprints} active sprints
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    AI signals
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{issueRows.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {aiInsights.recommendations.length} actions available
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-border/60 bg-background/85 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <p className="text-sm font-medium">Selected team slice</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                    <span>Visible members</span>
                    <span className="font-medium text-foreground">
                      {visibleMembersCount}/{allMembers.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                    <span>Open assigned work</span>
                    <span className="font-medium text-foreground">
                      {visibleOpenTasks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                    <span>Capacity risk</span>
                    <span className="font-medium text-foreground">
                      {visibleOverloadedMembers}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/85 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <BrainCircuit className="size-4 text-primary" />
                  <p className="text-sm font-medium">Reading the dashboard</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI anomalies stay project-wide because the backend returns
                  them for the full project. The filters here help you inspect
                  which part of the team slice is carrying the load.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Visible members"
          value={`${visibleMembersCount}/${allMembers.length}`}
          hint="Current team slice after filters"
          tone="info"
        />
        <MetricCard
          icon={Target}
          label="Visible assigned work"
          value={String(visibleAssignedTasks)}
          hint={`${visibleOpenTasks} open | ${visibleOverdueTasks} overdue`}
          tone={visibleOverdueTasks > 0 ? "warning" : "default"}
        />
        <MetricCard
          icon={BarChart3}
          label="Avg productivity"
          value={visibleAverageProductivity.toFixed(1)}
          hint="Across the selected members"
          tone="success"
        />
        <MetricCard
          icon={Sparkles}
          label="Visible sprint load"
          value={`${visibleCommittedPoints}/${visibleCapacityPoints}`}
          hint={`${visibleLoggedHours.toFixed(1)}h logged by the current slice`}
          tone={visibleOverloadedMembers > 0 ? "warning" : "default"}
        />
      </div>

      {permissions.canViewExecutiveAnalytics && (
        <ProjectProductivityMetrics
          report={report}
          productivity={productivity}
          workload={workload}
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.45fr]">
        <StatusDonutChart
          title="Project-wide task status"
          description="Completed, active, overdue, and stale work across the full project."
          data={deliveryBreakdown}
        />
        {permissions.canViewExecutiveAnalytics && (
          <TeamPerformanceChart
            title="Selected team load"
            description="Committed sprint points against available capacity for the members currently in view."
            data={performanceData}
            plannedLabel="Capacity"
            actualLabel="Committed"
          />
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Project-wide blocker signals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Each anomaly comes from the backend project AI pass, without a
                forced one-to-one pairing to the recommendation list.
              </p>
            </div>
            <Badge variant="outline" className="pm-tone-info">
              {issueRows.length} signals
            </Badge>
          </CardHeader>
          <CardContent>
            {issueRows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Suggested next step</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issueRows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="max-w-[260px] whitespace-normal">
                        <p className="font-medium">{row.issue}</p>
                      </TableCell>
                      <TableCell className="uppercase text-muted-foreground">
                        {row.source}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getSeverityClass(row.severity)}
                        >
                          {row.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[320px] whitespace-normal text-muted-foreground">
                        {row.guidance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={AlertTriangle}
                message="No blockers detected"
                description="The current AI anomaly run did not flag any blocker signals."
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {permissions.canViewExecutiveAnalytics && (
            <ProjectCapacityView
              capacity={{
                ...capacity,
                members: filteredCapacityMembers,
              }}
            />
          )}

          {permissions.canViewAiInsights && (
            <div className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="text-base font-semibold">AI recommendations</h3>
              </div>

            {aiInsights.recommendations.length > 0 ? (
              <div className="space-y-3">
                {aiInsights.recommendations.map((recommendation, index) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full pm-tone-info">
                        <Sparkles className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Recommendation {index + 1}
                        </p>
                        <p className="mt-1">{recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={AlertTriangle}
                message="No AI recommendations right now"
                description="The latest backend insight run did not return additional actions."
              />
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectAnalyticsDashboard;
