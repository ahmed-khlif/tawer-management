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
import { HardDrive, PlusCircle, Shield } from "lucide-react";

export default function ServersPageRender() {
  const t = useTranslations("modules.infrastructure.servers");
  const { user, isLoading } = useCurrentUser();

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
          user && hasPermissions(user.roles, "serversManagement", "add")
            ? { icon: PlusCircle, label: "Can add servers", tone: "success" }
            : false,
        ]}
        actions={user && hasPermissions(user.roles, "serversManagement", "add") ? <UploadServerDialog /> : null}
      />
      <div>
        <ServersList />
      </div>
    </AdminPageShell>
  );
}
