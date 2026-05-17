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
import { AppWindow, PlusCircle, ShieldCheck } from "lucide-react";

export default function ServicesPageRender() {
  const t = useTranslations("modules.infrastructure.services");
  const { user, isLoading } = useCurrentUser();

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
          user && hasPermissions(user.roles, "servicesManagement", "add")
            ? { icon: PlusCircle, label: "Can add services", tone: "success" }
            : false,
        ]}
        actions={user && hasPermissions(user.roles, "servicesManagement", "add") ? <UploadServiceDialog /> : null}
      />
      <div>
        <ServicesList />
      </div>
    </AdminPageShell>
  );
}
