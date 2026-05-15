"use client";

import { BarChart3, CheckCheck, Clock3, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  ProjectProductivityMetrics as ProjectProductivityMetricsData,
  ProjectReportOverview,
  ProjectTeamWorkload,
} from "@/modules/projects/types/project-insights";
import InsightMetricCard from "./insight-metric-card";

interface ProjectProductivityMetricsProps {
  report: ProjectReportOverview;
  productivity: ProjectProductivityMetricsData;
  workload: ProjectTeamWorkload;
}

export function ProjectProductivityMetrics({
  report,
  productivity,
  workload,
}: ProjectProductivityMetricsProps) {
  const t = useTranslations("modules.projects.project.details");
  const averageLoggedHours =
    workload.members.length > 0
      ? workload.totalLoggedHours / workload.members.length
      : 0;
  const completionPercent = Math.round(report.completionPercent ?? 0);
  const activeWorkload = Math.max(report.openTasks - report.overdueTasks, 0);

  const workloadSparkline = [
    { label: "Completed", value: report.completedTasks },
    { label: "Active", value: activeWorkload },
    { label: "Overdue", value: report.overdueTasks },
    { label: "Stuck", value: report.stuckTasks },
  ];

  const productivitySparkline = productivity.members
    .slice(0, 6)
    .map((member) => ({
      label: member.name,
      value: Number(member.productivityScore.toFixed(1)),
    }));

  const loggedSparkline = workload.members.slice(0, 6).map((member) => ({
    label: member.name,
    value: Number(member.loggedHours.toFixed(1)),
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <InsightMetricCard
        icon={CheckCheck}
        label={t("analytics.completion", { defaultValue: "Completion" })}
        value={`${completionPercent}%`}
        hint={`${report.completedTasks}/${report.totalTasks} tasks delivered`}
        progress={completionPercent}
        tone="success"
        trend={`${report.milestones.completionPercent}% milestones`}
      />
      <InsightMetricCard
        icon={BarChart3}
        label={t("analytics.productivity", { defaultValue: "Avg productivity" })}
        value={productivity.teamAverageProductivityScore.toFixed(1)}
        hint={`${productivity.members.length} contributors scored`}
        sparkline={productivitySparkline}
        tone="info"
      />
      <InsightMetricCard
        icon={Clock3}
        label={t("analytics.loggedHours", { defaultValue: "Avg logged hours" })}
        value={`${averageLoggedHours.toFixed(1)}h`}
        hint={`${workload.totalLoggedHours.toFixed(1)}h tracked total`}
        sparkline={loggedSparkline}
        tone="default"
      />
      <InsightMetricCard
        icon={Target}
        label={t("analytics.openTasks", { defaultValue: "Open tasks" })}
        value={String(report.openTasks)}
        hint={`${report.overdueTasks} overdue • ${report.stuckTasks} stuck`}
        sparkline={workloadSparkline}
        tone={report.overdueTasks > 0 || report.stuckTasks > 0 ? "warning" : "default"}
      />
    </div>
  );
}

export default ProjectProductivityMetrics;
