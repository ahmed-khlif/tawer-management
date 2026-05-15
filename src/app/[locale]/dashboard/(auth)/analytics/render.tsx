"use client";

import AccessDenied from "@/components/error/access-denied";
import Loading from "@/components/page-loader";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import ExecutiveDashboard from "@/modules/analytics/components/executive/executive-dashboard";
import { canViewExecutiveOverview } from "@/modules/analytics/utils/access";

export default function AnalyticsPageRender() {
  const { user, isLoading } = useCurrentUser();
  const canView = canViewExecutiveOverview(user?.roles);

  if (isLoading) {
    return <Loading />;
  }

  if (!canView) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Executive Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Executive portfolio health across your accessible business units, with a separate view of your own productivity.
        </p>
      </header>
      <ExecutiveDashboard />
    </div>
  );
}
