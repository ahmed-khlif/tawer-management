"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Folder,
  ListChecks,
  Sigma,
  Timer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMyWorkloadSummary } from "@/modules/projects/hooks/tasks/use-my-workload-summary";
import { MetricCard } from "@/modules/projects/components/shared/metric-card";

function buildBreakdown(record: Record<string, number>) {
  return Object.entries(record)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
}

export function MyWorkloadSummaryCard() {
  const { data, isLoading, isError } = useMyWorkloadSummary();

  if (isError) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="p-4 text-sm text-destructive">
          Could not load workload summary.
        </CardContent>
      </Card>
    );
  }

  const loading = isLoading || !data;

  const completionRate =
    !data || data.totalAssignedTasks === 0
      ? 0
      : Math.round((data.completedTasks / data.totalAssignedTasks) * 100);

  const statusBreakdown = data ? buildBreakdown(data.byStatus) : [];
  const priorityBreakdown = data ? buildBreakdown(data.byPriority) : [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          icon={Folder}
          label="Active projects"
          value={data?.activeProjects ?? 0}
          tone="primary"
          loading={loading}
        />
        <MetricCard
          icon={ListChecks}
          label="Open tasks"
          value={data?.openTasks ?? 0}
          hint={data ? `${data.totalAssignedTasks} assigned` : undefined}
          tone="running"
          loading={loading}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Completed"
          value={data?.completedTasks ?? 0}
          hint={data ? `${completionRate}% completion` : undefined}
          tone="success"
          progress={data ? completionRate : undefined}
          loading={loading}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Overdue"
          value={data?.overdueTasks ?? 0}
          tone={data && data.overdueTasks > 0 ? "destructive" : "default"}
          emphasize={Boolean(data && data.overdueTasks > 0)}
          loading={loading}
        />
        <MetricCard
          icon={CalendarClock}
          label="Due next 7d"
          value={data?.dueNext7Days ?? 0}
          tone="warning"
          loading={loading}
        />
        <MetricCard
          icon={Sigma}
          label="Story points"
          value={data?.totalStoryPoints ?? 0}
          tone="info"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          icon={Timer}
          label="Estimated"
          value={data ? `${data.totalEstimatedHours}h` : "—"}
          tone="info"
          loading={loading}
        />
        <MetricCard
          icon={Clock}
          label="Actual"
          value={data ? `${data.totalActualHours}h` : "—"}
          tone="running"
          loading={loading}
        />
        <MetricCard
          icon={Clock}
          label="Logged"
          value={data ? `${data.totalLoggedHours}h` : "—"}
          tone="success"
          loading={loading}
        />
      </div>

      {!loading && (statusBreakdown.length > 0 || priorityBreakdown.length > 0) ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {statusBreakdown.length > 0 ? (
            <Card>
              <CardContent className="p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                  By status
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusBreakdown.map(([status, count]) => (
                    <span
                      key={status}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                    >
                      <span className="font-medium">{status}</span>
                      <span className="text-muted-foreground">· {count}</span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
          {priorityBreakdown.length > 0 ? (
            <Card>
              <CardContent className="p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                  By priority
                </p>
                <div className="flex flex-wrap gap-2">
                  {priorityBreakdown.map(([priority, count]) => (
                    <span
                      key={priority}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                    >
                      <span className="font-medium">{priority}</span>
                      <span className="text-muted-foreground">· {count}</span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default MyWorkloadSummaryCard;
