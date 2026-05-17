"use client";;
import { ProfileHeader } from "./header";
import { ProfileSidebar } from "./sidebar";
import Loading from "@/components/page-loader";
import Error404 from "@/components/error/404";
import type { UserType } from "../../types/users";
import ActivityTrackingAndWorkerDateRating from "@/modules/tracking/components/activity-tracking-working-date-rating";
import WorkedDaysTracking from "@/modules/tracking/components/work-tracking-calendar.tsx";
import MyWorkloadSummaryCard from "@/modules/projects/components/assigned-tasks/my-workload-summary-card";
import { useMyWorkloadSummary } from "@/modules/projects/hooks/tasks/use-my-workload-summary";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Bell, ChartColumnIncreasing, ListChecks } from "lucide-react";

interface Props {
  user?: UserType | null;
  isLoading: boolean;
  isMyProfile?: boolean;
}

export function ProfilePage({ user, isLoading, isMyProfile = false }: Props) {
  const workloadSummaryQuery = useMyWorkloadSummary(isMyProfile);
  const activeProjectCount =
    isMyProfile && workloadSummaryQuery.data
      ? workloadSummaryQuery.data.activeProjects
      : user?.workedProjects;

  return isLoading ? (
    <Loading />
  ) : user === null ? (
    <Error404 />
  ) : (
    user && (
      <div className="bg-background min-h-screen font-sans antialiased">
        <ProfileHeader
          user={user}
          activeProjectCount={activeProjectCount}
          isMyProfile={isMyProfile}
        />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-6">
              <ProfileSidebar
                user={user}
                isMyProfile={isMyProfile}
                activeProjectCount={activeProjectCount}
              />
            </aside>

            <main className="space-y-8">
              {isMyProfile ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href="/dashboard/todo-list/project">
                        <ListChecks className="size-4" />
                        Assigned tasks
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href="/dashboard/reminders">
                        <Bell className="size-4" />
                        Reminders
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href={`/dashboard/analytics/employees/${user.id}`}>
                        <ChartColumnIncreasing className="size-4" />
                        Employee analytics
                      </Link>
                    </Button>
                  </div>

                  <MyWorkloadSummaryCard />
                </div>
              ) : (
                <Card className="border-border/70 bg-card/95 shadow-sm">
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">Workspace snapshot</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Review this teammate&apos;s activity trends and jump into employee analytics when you need deeper context.
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href={`/dashboard/analytics/employees/${user.id}`}>
                        Open employee analytics
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </CardHeader>
                </Card>
              )}
              <ActivityTrackingAndWorkerDateRating userId={user.id} isMyProfile={isMyProfile} />
              <WorkedDaysTracking userId={user.id} isMyProfile={isMyProfile} />
            </main>
          </div>
        </div>
      </div>
    )
  );
}
