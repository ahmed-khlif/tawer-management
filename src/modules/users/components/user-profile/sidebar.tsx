"use client";
import Link from "next/link";
import { Mail, Users, Phone, FolderKanban, Bell, ChartColumnIncreasing, ListChecks } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UserType } from "../../types/users";
import useUserRoles from "@/modules/auth/hooks/users/roles";
import {
  castRoleFromBackendToFrontend,
  castRoleFromFrontendToBackend,
} from "@/modules/auth/utils/user-roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatUserRoleLabel } from "@/modules/projects/utils/format-user-role";
import {
  userRoleBadgeClass,
  userRoleDotClass,
  userRoleStyle,
} from "@/modules/projects/utils/badges/user-role-badges";

interface Props {
  user: UserType;
  isMyProfile?: boolean;
  activeProjectCount?: number;
}

export function ProfileSidebar({
  user,
  isMyProfile = false,
  activeProjectCount,
}: Props) {
  const t = useTranslations("modules.users.profile");
  const { roles } = useUserRoles();
  const labeledRoles = user.roles.map((userRole) => {
    const backendRole = castRoleFromFrontendToBackend(userRole);
    const catalogLabel =
      roles.length > 0
        ? roles.find((role) => castRoleFromBackendToFrontend(role.value) === userRole)
            ?.label
        : undefined;

    return {
      frontendRole: userRole,
      backendRole,
      label: catalogLabel || formatUserRoleLabel(backendRole),
    };
  });

  return (
    <div className="sticky top-24 space-y-5">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">{t("about")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="group flex items-center gap-4 text-sm">
            <div className="bg-muted border-border group-hover:border-primary/30 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors">
              <Users className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
            </div>
            <span className="text-foreground font-bold tracking-tight">{user.name}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {labeledRoles.map((userRole) => (
              <Badge
                key={userRole.frontendRole}
                variant="outline"
                className={userRoleBadgeClass("gap-1.5")}
                style={userRoleStyle(userRole.backendRole)}
              >
                <span className={userRoleDotClass()} />
                {userRole.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">{t("contacts")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="group flex items-center gap-4 text-sm">
            <div className="bg-muted border-border group-hover:border-primary/30 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors">
              <Mail className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
            </div>
            <span className="text-muted-foreground group-hover:text-foreground truncate font-medium transition-colors">
              {user.email}
            </span>
          </div>
          {user.phone && (
            <div className="group flex items-center gap-4 text-sm">
              <div className="bg-muted border-border group-hover:border-primary/30 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors">
                <Phone className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
              </div>
              <span className="text-muted-foreground group-hover:text-foreground font-medium transition-colors">
                {user.phone}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Project workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                <FolderKanban className="size-3.5" />
                Projects
              </div>
              <p className="mt-2 text-lg font-semibold">
                {activeProjectCount ?? user.workedProjects ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                <Users className="size-3.5" />
                Teams
              </div>
              <p className="mt-2 text-lg font-semibold">{user.teams.length}</p>
            </div>
          </div>

          {user.teams.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.teams.map((team) => (
                <Badge key={team.id} variant="secondary" className="rounded-full">
                  {team.name}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="grid gap-2">
            {isMyProfile ? (
              <>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/dashboard/todo-list/project">
                    <ListChecks className="size-4" />
                    Open assigned project tasks
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href={`/dashboard/analytics/employees/${user.id}`}>
                    <ChartColumnIncreasing className="size-4" />
                    Open employee analytics
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/dashboard/reminders">
                    <Bell className="size-4" />
                    Review reminders
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href={`/dashboard/analytics/employees/${user.id}`}>
                  <ChartColumnIncreasing className="size-4" />
                  View employee analytics
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
