"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  FolderKanban,
  Sigma,
  TimerReset,
  Trophy,
} from "lucide-react";
import AccessDenied from "@/components/error/access-denied";
import { ErrorBanner } from "@/components/error-banner";
import Loading from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/modules/projects/components/shared/metric-card";
import {
  useEmployeeAnalyticsSummary,
  useEmployeeProductivityMetrics,
} from "@/modules/analytics/hooks/use-analytics";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { resolveEmployeeAnalyticsAccess } from "@/modules/analytics/utils/access";

interface Props {
  userId: string;
}

export default function EmployeeAnalyticsPageRender({ userId }: Props) {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const summaryQuery = useEmployeeAnalyticsSummary(userId);
  const productivityQuery = useEmployeeProductivityMetrics(userId);

  const access = resolveEmployeeAnalyticsAccess({
    currentUser: user,
    targetUserId: userId,
  });
  const isForbidden =
    (isAxiosError(summaryQuery.error) && summaryQuery.error.response?.status === 403) ||
    (isAxiosError(productivityQuery.error) &&
      productivityQuery.error.response?.status === 403);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href={access.backHref}>
            <ArrowLeft className="mr-2 size-4" />
            {access.backLabel}
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {summaryQuery.data?.userName ?? "Employee"} Employee Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Detailed task counts, story points, and on-time delivery rate.
          </p>
        </div>
      </div>

      {((summaryQuery.error || productivityQuery.error) && !isForbidden) ? (
        <ErrorBanner
          error="Unable to load employee analytics data."
          onRetry={() => {
            void summaryQuery.refetch();
            void productivityQuery.refetch();
          }}
        />
      ) : (
        <>
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

          <Card>
            <CardHeader>
              <CardTitle>Productivity metrics</CardTitle>
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
        </>
      )}
    </div>
  );
}
