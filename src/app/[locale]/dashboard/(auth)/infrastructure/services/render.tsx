"use client";;
import { useTranslations } from "next-intl";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import Loading from "@/components/page-loader";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";
import ServicesList from "@/modules/infrastructure/components/services/services-list";
import UploadServiceDialog from "@/modules/infrastructure/components/services/upload";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { AlertTriangle, AppWindow, PlusCircle, ShieldCheck } from "lucide-react";
import useServiceOverview from "@/modules/infrastructure/hooks/extractions/use-service-overview";
import InfrastructureOverviewCards from "@/modules/infrastructure/components/shared/infrastructure-overview-cards";

export default function ServicesPageRender() {
  const t = useTranslations("modules.infrastructure.services");
  const { user, isLoading } = useCurrentUser();
  const { overview, overviewIsLoading } = useServiceOverview();

  if (isLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "servicesManagement", "view")) return <AccessDenied />;

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={AppWindow}
        title={t("title")}
        description="Monitor internal services, runtime status, and operational coverage in a layout aligned with project management."
        metrics={[
          { icon: ShieldCheck, label: "Operational catalog", tone: "primary" },
          overview
            ? {
                icon: AlertTriangle,
                value: overview.incidentsOpen,
                label: "open incidents",
                tone: overview.incidentsOpen > 0 ? "destructive" : "success",
              }
            : false,
          user && hasPermissions(user.roles, "servicesManagement", "add")
            ? { icon: PlusCircle, label: "Can add services", tone: "success" }
            : false,
        ]}
        actions={user && hasPermissions(user.roles, "servicesManagement", "add") ? <UploadServiceDialog /> : null}
      />
      <InfrastructureOverviewCards
        total={overview?.total}
        running={overview?.running}
        incidentsOpen={overview?.incidentsOpen}
        expiringSoon={overview?.expiringSoon}
        unpaid={overview?.unpaid}
        lastHealthCheckAt={overview?.lastHealthCheckAt}
        totalLabel={t("overview.totalLabel")}
        runningLabel={t("overview.runningLabel")}
        incidentsLabel={t("overview.incidentsLabel")}
        expiringLabel={t("overview.expiringLabel")}
        unpaidLabel={t("overview.unpaidLabel")}
        totalHint={t("overview.totalHint")}
        runningHint={t("overview.runningHint")}
        incidentsHint={t("overview.incidentsHint")}
        expiringHint={t("overview.expiringHint")}
        unpaidHint={t("overview.unpaidHint")}
        loading={overviewIsLoading}
      />
      <div>
        <ServicesList />
      </div>
    </AdminPageShell>
  );
}
