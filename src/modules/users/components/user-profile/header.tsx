"use client";
import {
  ChevronLeft,
  FolderKanban,
  Hourglass,
  Clock,
  Smile,
  CircleGauge,
  Building2,
  Wifi,
  WifiOff,
  Eye,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { UserType } from "../../types/users";
import useUserRoles from "@/modules/auth/hooks/users/roles";
import {
  castRoleFromBackendToFrontend,
  castRoleFromFrontendToBackend,
} from "@/modules/auth/utils/user-roles";
import { useTranslations } from "next-intl";
import StarRating from "@/components/star-rating/input";
import { Badge } from "@/components/ui/badge";
import { formatTimeSpentFromMinutesToHours } from "@/utils/format-time";
import { getMoodEmoji } from "@/utils/emojies";
import { formatUserRoleLabel } from "@/modules/projects/utils/format-user-role";
import {
  userRoleBadgeClass,
  userRoleDotClass,
  userRoleStyle,
} from "@/modules/projects/utils/badges/user-role-badges";
import useWorkSession from "@/modules/tracking/hook/work-sessions/use-work-session";
import { useViewerModeStore } from "@/modules/tracking/store/viewer-mode-store";

interface Props {
  user: UserType;
  activeProjectCount?: number;
  isMyProfile?: boolean;
}

export function ProfileHeader({
  user,
  activeProjectCount,
  isMyProfile = false,
}: Props) {
  const router = useRouter();
  const { roles } = useUserRoles();
  const t = useTranslations("modules.users.profile");
  const { workSession, isLoading: workSessionIsLoading } = useWorkSession();
  const { viewerModeIsActive } = useViewerModeStore((store) => store);
  const labeledRoles = user.roles.map((role) => {
    const backendRole = castRoleFromFrontendToBackend(role);
    const catalogLabel =
      roles.length > 0
        ? roles.find((r) => castRoleFromBackendToFrontend(r.value) === role)?.label
        : undefined;

    return {
      frontendRole: role,
      backendRole,
      label: catalogLabel || formatUserRoleLabel(backendRole),
    };
  });
  const showViewerModeBadge =
    isMyProfile && viewerModeIsActive && !workSessionIsLoading;
  const effectiveIsCheckedIn = isMyProfile
    ? workSessionIsLoading
      ? user.isOnline
      : !viewerModeIsActive && workSession.status === "in"
    : user.isOnline;

  const metrics = [
    {
      id: "timeWorked",
      icon: Hourglass,
      label: t("totalTimeWorked"),
      value: formatTimeSpentFromMinutesToHours(user.timeWorkedInMinutes || 0)
    },
    {
      id: "projects",
      icon: FolderKanban,
      label: t("workedOnProjects"),
      value: t("projectsNumber", {
        count: activeProjectCount ?? user.workedProjects ?? 0,
      })
    },
    {
      id: "avgSession",
      icon: Clock,
      label: t("averageSession"),
      value: formatTimeSpentFromMinutesToHours(user.averageSessionTimeInMinutes || 0)
    },
    {
      id: "mood",
      icon: Smile,
      label: t("avgDailyMood"),
      value: user.averageDailyMood
        ? `${getMoodEmoji(user.averageDailyMood)} ${user.averageDailyMood}/5`
        : "N/A"
    },
    {
      id: "performance",
      icon: CircleGauge,
      label: t("avgRatedPerformance"),
      customRender: user.averagePerformanceRating ? (
        <StarRating rating={user.averagePerformanceRating} />
      ) : (
        "N/A"
      )
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm dark:rounded-none dark:border-x-0 dark:border-t-0 dark:border-b">
      <div className="bg-muted relative h-48 w-full overflow-hidden lg:h-64">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.34),_transparent_34%),linear-gradient(135deg,_#e0ecff,_#dbeafe_42%,_#c7d2fe_78%,_#e9d5ff)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_35%),linear-gradient(135deg,_#0f172a,_#1e1b4b_45%,_#102033)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.22)_45%,transparent_100%)] dark:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_45%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/55 to-transparent dark:from-background/35" />
        <div className="absolute top-5 right-5 rounded-full border border-slate-900/10 bg-white/55 px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-slate-700 backdrop-blur-sm dark:border-white/15 dark:bg-white/5 dark:text-primary-foreground/85">
          TDG Workspace
        </div>
        <Button
          onClick={() => router.back()}
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 h-8 w-8 rounded-full border border-black/5 bg-white/75 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-background/60">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="relative -mt-12 flex flex-col items-center gap-6 md:-mt-16 md:flex-row md:items-end">
          <Avatar className="border-background h-24 w-24 border-4 shadow-xl md:h-32 md:w-32">
            <AvatarImage src={user.image || "/placeholder.svg"} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <Badge
                  variant="outline"
                  className={
                    showViewerModeBadge
                      ? "pm-tone-info border"
                      : effectiveIsCheckedIn
                        ? "pm-tone-success border"
                        : "border-border bg-muted text-muted-foreground"
                  }
                >
                  {showViewerModeBadge ? (
                    <Eye className="size-3" />
                  ) : effectiveIsCheckedIn ? (
                    <Wifi className="size-3" />
                  ) : (
                    <WifiOff className="size-3" />
                  )}
                  {showViewerModeBadge
                    ? "Viewer mode"
                    : effectiveIsCheckedIn
                      ? "Checked in"
                      : "Not checked in"}
                </Badge>
                {user.teams.length > 0 ? (
                  <Badge variant="outline" className="pm-tone-info border gap-1">
                    <Building2 className="size-3" />
                    {user.teams.length} team{user.teams.length > 1 ? "s" : ""}
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                {user.name}
              </h1>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {labeledRoles.map((role) => (
                <Badge
                  key={role.frontendRole}
                  variant="outline"
                  className={userRoleBadgeClass("gap-1.5 font-medium")}
                  style={userRoleStyle(role.backendRole)}
                >
                  <span className={userRoleDotClass()} />
                  {role.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="border-border/70 mt-8 grid grid-cols-2 gap-4 border-t pt-8 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((metric) => (
            <div key={metric.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-sm">
              <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                <metric.icon className="h-3.5 w-3.5" />
                <span className="truncate">{metric.label}</span>
              </div>
              <div className="text-foreground text-sm font-semibold tracking-tight">
                {metric.customRender || metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
