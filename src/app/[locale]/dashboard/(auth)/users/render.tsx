"use client";
import UsersList from "@/modules/users/components/users-list";
import UploadUserDialog from "@/modules/users/components/upload";
import { useTranslations } from "next-intl";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import Loading from "@/components/page-loader";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { Users, UserPlus } from "lucide-react";

export default function UsersPageRender() {
  const t = useTranslations("modules.users");
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "usersManagement", "view")) return <AccessDenied />;

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={Users}
        title={t("title")}
        description="Manage people, roles, availability, and team presence in the same workspace rhythm as project management."
        metrics={[
          {
            icon: Users,
            label: "Directory workspace",
            tone: "primary",
          },
          user && hasPermissions(user.roles, "usersManagement", "add")
            ? {
                icon: UserPlus,
                label: "Can add users",
                tone: "success",
              }
            : false,
        ]}
        actions={user && hasPermissions(user.roles, "usersManagement", "add") ? <UploadUserDialog /> : null}
      />
      <div>
        <UsersList />
      </div>
    </AdminPageShell>
  );
}
