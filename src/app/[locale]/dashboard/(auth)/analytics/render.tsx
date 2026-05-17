"use client";

import AccessDenied from "@/components/error/access-denied";
import Loading from "@/components/page-loader";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import ExecutiveDashboard from "@/modules/analytics/components/executive/executive-dashboard";
import { canViewExecutiveOverview } from "@/modules/analytics/utils/access";
import { Activity, ShieldCheck, Users } from "lucide-react";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";

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
    <AdminPageShell>
      <PageHeaderStrip
        icon={Activity}
        title="Executive Analytics"
        description="Portfolio health across your accessible business units, with a separated view of your own productivity and delivery signals."
        metrics={[
          {
            icon: ShieldCheck,
            label: "Executive access",
            tone: "primary",
          },
          {
            icon: Users,
            label: "Portfolio + personal view",
            tone: "info",
          },
        ]}
      />
      <ExecutiveDashboard />
    </AdminPageShell>
  );
}
