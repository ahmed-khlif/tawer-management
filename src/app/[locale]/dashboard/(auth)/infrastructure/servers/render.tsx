"use client";;
import { useTranslations } from "next-intl";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import Loading from "@/components/page-loader";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";
import ServersList from "@/modules/infrastructure/components/servers/servers-list";
import UploadServerDialog from "@/modules/infrastructure/components/servers/upload";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { AlertTriangle, HardDrive, PlusCircle, Shield } from "lucide-react";
import useServerOverview from "@/modules/infrastructure/hooks/extractions/use-server-overview";
import InfrastructureOverviewCards from "@/modules/infrastructure/components/shared/infrastructure-overview-cards";

export default function ServersPageRender() {
  const t = useTranslations("modules.infrastructure.servers");
  const { user, isLoading } = useCurrentUser();
  const { overview, overviewIsLoading } = useServerOverview();

  if (isLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "serversManagement", "view")) return <AccessDenied />;

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={HardDrive}
        title={t("title")}
        description="Track infrastructure inventory, runtime state, and machine ownership in the same operating system as your PM workspace."
        metrics={[
          { icon: Shield, label: "Infrastructure visibility", tone: "primary" },
          overview
            ? {
                icon: AlertTriangle,
                value: overview.incidentsOpen,
                label: "open incidents",
                tone: overview.incidentsOpen > 0 ? "destructive" : "success",
              }
            : false,
          user && hasPermissions(user.roles, "serversManagement", "add")
            ? { icon: PlusCircle, label: "Can add servers", tone: "success" }
            : false,
        ]}
        actions={user && hasPermissions(user.roles, "serversManagement", "add") ? <UploadServerDialog /> : null}
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
        <ServersList />
      </div>
    </AdminPageShell>
  );
}
