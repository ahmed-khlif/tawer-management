"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BrainCircuit,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useAiProjectMetrics,
  useProjectAnomalies,
} from "@/modules/ai/hooks/use-ai";
import { fetchProjectAiInsights } from "@/modules/projects/services/api/project-ai-insights";
import ProjectAiInsightsCard from "./project-ai-insights-card";
import ProjectAnomaliesList from "./project-anomalies-list";
import { EmptyState } from "../../shared/empty-state";
import { PageHeaderStrip } from "../../shared/page-header-strip";
import { MetricCard } from "../../shared/metric-card";

interface ProjectAiInsightsTabProps {
  projectId: string;
}

function ProjectAiInsightsTabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-52 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function ProjectAiInsightsTab({
  projectId,
}: ProjectAiInsightsTabProps) {
  const t = useTranslations("modules.projects.project.details");
  const queryClient = useQueryClient();
  const aggregatorQuery = useQuery({
    queryKey: ["project-ai-insights", projectId],
    queryFn: () => fetchProjectAiInsights(projectId),
    enabled: !!projectId,
  });
  const metricsQuery = useAiProjectMetrics(projectId);
  const anomaliesQuery = useProjectAnomalies(projectId);

  const handleRefresh = async () => {
    await Promise.allSettled([
      queryClient.invalidateQueries({
        queryKey: ["project-ai-insights", projectId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["ai-project-metrics", projectId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["ai-project-anomalies", projectId],
      }),
    ]);
  };

  const isFetching =
    aggregatorQuery.isFetching ||
    metricsQuery.isFetching ||
    anomaliesQuery.isFetching;

  const headerMetrics = aggregatorQuery.data
    ? [
        {
          key: "live",
          icon: CheckCircle2,
          tone: "success" as const,
          label: t("aiInsights.live", {
            defaultValue: "Live backend AI data",
          }),
        },
        {
          key: "anomalies",
          icon: AlertCircle,
          tone:
            aggregatorQuery.data.anomalies.length > 0
              ? ("warning" as const)
              : ("info" as const),
          value: aggregatorQuery.data.anomalies.length,
          label: t("aiInsights.anomaliesLabel", {
            defaultValue: "anomalies",
          }),
        },
        {
          key: "recommendations",
          icon: BrainCircuit,
          tone: "running" as const,
          value: aggregatorQuery.data.recommendations.length,
          label: t("aiInsights.recommendationsLabel", {
            defaultValue: "recommendations",
          }),
        },
      ]
    : undefined;

  const headerStrip = (
    <PageHeaderStrip
      icon={BrainCircuit}
      title={t("aiInsights.title", { defaultValue: "AI insights" })}
      description={t("aiInsights.subtitle", {
        defaultValue:
          "AI-powered signals on estimates, blockers, and anomalies for this project.",
      })}
      metrics={headerMetrics}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="gap-1.5"
        >
          {isFetching ? (
            <Spinner className="size-4" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {t("aiInsights.refresh", { defaultValue: "Refresh AI signals" })}
        </Button>
      }
    />
  );

  if (aggregatorQuery.isLoading) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <ProjectAiInsightsTabSkeleton />
      </div>
    );
  }

  if (aggregatorQuery.error) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <ErrorBanner
          error={t("aiInsights.loadError", {
            defaultValue: "Unable to load AI insights for this project.",
          })}
          onRetry={() => void aggregatorQuery.refetch()}
        />
      </div>
    );
  }

  const data = aggregatorQuery.data;
  const directMetrics = metricsQuery.data;
  const directAnomalies = anomaliesQuery.data?.anomalies;

  if (!data) {
    return (
      <div className="space-y-4">
        {headerStrip}
        <EmptyState
          icon={BrainCircuit}
          message={t("aiInsights.emptyTitle", {
            defaultValue: "No AI insights available",
          })}
          description={t("aiInsights.emptyDescription", {
            defaultValue:
              "Run the backend analysis pipeline to surface project insights.",
          })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {headerStrip}

      {directMetrics ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("aiInsights.directMetrics", {
                defaultValue: "Live AI metrics",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <MetricCard
              icon={TrendingUp}
              label={t("aiInsights.onEstimate", {
                defaultValue: "On-estimate %",
              })}
              value={`${Math.round(directMetrics.onEstimateRatePercent)}%`}
              progress={directMetrics.onEstimateRatePercent}
              tone="running"
            />
            <MetricCard
              icon={Clock}
              label={t("aiInsights.estimateMae", {
                defaultValue: "Estimate MAE",
              })}
              value={`${directMetrics.estimateMaeHours.toFixed(1)}h`}
              tone="info"
            />
            <MetricCard
              icon={CheckCircle2}
              label={t("aiInsights.completedWithEstimate", {
                defaultValue: "Completed w/ estimate",
              })}
              value={String(directMetrics.completedTasksWithEstimates)}
              tone="success"
            />
            <MetricCard
              icon={AlertCircle}
              label={t("aiInsights.blockedTasks", {
                defaultValue: "Blocked tasks",
              })}
              value={String(directMetrics.blockedTasks)}
              tone={directMetrics.blockedTasks > 0 ? "destructive" : "default"}
              emphasize={directMetrics.blockedTasks > 0}
            />
          </CardContent>
        </Card>
      ) : null}

      <ProjectAiInsightsCard insights={data} />
      <ProjectAnomaliesList anomalies={directAnomalies ?? data.anomalies} />
    </div>
  );
}

export default ProjectAiInsightsTab;
