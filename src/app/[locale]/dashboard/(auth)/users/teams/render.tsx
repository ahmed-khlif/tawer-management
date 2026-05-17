"use client";
import { useTranslations } from "next-intl";
import UploadTeamDialog from "@/modules/users/components/teams/upload";
import TeamsList from "@/modules/users/components/teams/list";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import Loading from "@/components/page-loader";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { Users, UserPlus2 } from "lucide-react";

export default function TeamsPageRender() {
  const t = useTranslations("modules.users.teams");
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "teamsManagement", "view")) return <AccessDenied />;

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={Users}
        title={t("title")}
        description="Organize delivery squads, managers, and team structure with the same premium workspace language as PM."
        metrics={[
          {
            icon: Users,
            label: "Team structure",
            tone: "primary",
          },
          user && hasPermissions(user.roles, "teamsManagement", "add")
            ? {
                icon: UserPlus2,
                label: "Can create teams",
                tone: "success",
              }
            : false,
        ]}
        actions={user && hasPermissions(user.roles, "teamsManagement", "add") ? <UploadTeamDialog /> : null}
      />
      <div>
        <TeamsList />
      </div>
    </AdminPageShell>
  );
}
