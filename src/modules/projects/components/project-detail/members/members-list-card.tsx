import { dateToString } from "@/utils/date";
import Link from "next/link";
import {
  Calendar,
  ShieldCheck,
  MoreHorizontal,
  Trash2,
  Crown,
  User,
  Users,
  Activity,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  AvatarIndicator,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { ListCard } from "../../shared/list-card";
import { ProjectMember as ProjectMemberType } from "../../../types/projects";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { formatUserRoleLabel } from "../../../utils/format-user-role";
import {
  userRoleBadgeClass,
  userRoleDotClass,
  userRoleStyle,
} from "../../../utils/badges/user-role-badges";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface MembersListCardProps {
  members: ProjectMemberType[];
  tasks?: ProjectTaskType[];
  onUpdateRole: (memberId: string, data: { isManager: boolean }) => void;
  onRemoveMember: (memberId: string) => void;
  isPending: boolean;
  canRemoveMember: boolean;
  canManageManagers: boolean;
  canRemoveLastManager: boolean;
  canViewEmployeeAnalytics: boolean;
}

export function MembersListCard({
  members,
  tasks = [],
  onUpdateRole,
  onRemoveMember,
  isPending,
  canRemoveMember,
  canManageManagers,
  canRemoveLastManager,
  canViewEmployeeAnalytics,
}: MembersListCardProps) {
  const t = useTranslations("modules.projects.project.details");
  const managerCount = members.filter((m) => m.isManager).length;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        {members.length === 0 ? (
          <Empty className="border-dashed border bg-muted/30">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="size-5" />
              </EmptyMedia>
              <EmptyTitle>
                {t("membersList.empty", { defaultValue: "No active members." })}
              </EmptyTitle>
              <EmptyDescription>
                {t("membersList.emptyHint", {
                  defaultValue:
                    "Invite teammates to start collaborating on this project.",
                })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {members.map((member) => {
              const isLastManager = member.isManager && managerCount <= 1;
              const allowDemote = canManageManagers && !isLastManager;
              const allowRemove =
                ((canRemoveMember && !member.isManager) ||
                  (canManageManagers &&
                    (!isLastManager || canRemoveLastManager)));

              const displayName = member.user?.name || member.userId;
              const initials = displayName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((s: string) => s[0]?.toUpperCase() ?? "")
                .join("") || "?";

              return (
                <ListCard
                  key={member.id}
                  avatar={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="size-9 border bg-muted">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {initials}
                          </AvatarFallback>
                          {member.isManager ? (
                            <AvatarIndicator
                              variant="success"
                              position="bottom-end"
                              aria-label={t("membersList.manager")}
                            />
                          ) : null}
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        {member.isManager
                          ? t("membersList.manager")
                          : t("membersList.member")}
                      </TooltipContent>
                    </Tooltip>
                  }
                  primary={
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{displayName}</span>
                      {member.isManager ? (
                        <Crown
                          className="size-3.5 shrink-0 text-primary"
                          aria-label={t("membersList.manager")}
                        />
                      ) : null}
                    </span>
                  }
                  secondary={
                    <div className="flex flex-col gap-2 w-full max-w-[300px]">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground/60">
                        <Calendar className="size-3" />
                        {t("membersList.joined")}{" "}
                        {dateToString(new Date(member.createdAt))}
                      </span>
                    </div>
                  }
                  badge={
                    <div className="flex items-center gap-8 w-full">
                      <div className="hidden lg:flex items-center gap-6 flex-1 min-w-[200px] max-w-[300px]">
                        {(() => {
                          const memberTasks = tasks.filter((task) => task.assigneeId === member.userId);
                          const completedTasks = memberTasks.filter((task) => 
                            ["DONE", "COMPLETED"].includes(task.status?.toUpperCase() ?? "")
                          ).length;
                          const totalTasks = memberTasks.length;
                          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                          
                          return (
                            <>
                              <div className="flex flex-col gap-1 flex-1">
                                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
                                  <span>Progress</span>
                                  <span className="text-foreground/70">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-1 bg-muted/40" />
                              </div>
                              <div className="flex flex-col gap-0.5 items-end">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Tasks</span>
                                <span className="text-[11px] font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="size-3 text-primary/70" />
                                  {completedTasks}/{totalTasks}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1 justify-end ml-auto">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-5 font-bold uppercase tracking-wider px-2",
                            member.isManager
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-muted/50 text-muted-foreground border-muted/50",
                          )}
                        >
                          {member.isManager ? (
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="size-3" />{" "}
                              {t("membersList.manager")}
                            </span>
                          ) : (
                            t("membersList.member")
                          )}
                        </Badge>
                        {isLastManager ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 cursor-help"
                              >
                                {t("membersList.lastManager", {
                                  defaultValue: "Last manager",
                                })}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t("membersList.lastManagerHint", {
                                defaultValue:
                                  "At least one manager must remain on the project.",
                                })}
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                        {(member.userRoles ?? []).map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] h-5 font-bold uppercase tracking-wider",
                              userRoleBadgeClass(),
                            )}
                            style={userRoleStyle(role)}
                            title={role}
                          >
                            <span className={userRoleDotClass()} aria-hidden />
                            {formatUserRoleLabel(role)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  }
                  actions={
                    allowDemote || allowRemove || canViewEmployeeAnalytics ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="Member actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canViewEmployeeAnalytics ? (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/analytics/employees/${member.userId}`}>
                                  <Activity className="size-4 mr-2" />
                                  View Employee Analytics
                                </Link>
                              </DropdownMenuItem>
                              {(allowDemote || allowRemove) ? <DropdownMenuSeparator /> : null}
                            </>
                          ) : null}
                          {canManageManagers && (
                            <DropdownMenuItem
                              onClick={() =>
                                onUpdateRole(member.id, {
                                  isManager: !member.isManager,
                                })
                              }
                              disabled={
                                isPending || (member.isManager && isLastManager)
                              }
                            >
                              <ShieldCheck className="size-4 mr-2" />
                              {member.isManager
                                ? t("membersList.demote", {
                                    defaultValue: "Remove Manager Role",
                                  })
                                : t("membersList.promote", {
                                    defaultValue: "Make Manager",
                                  })}
                            </DropdownMenuItem>
                          )}
                          {allowRemove && (
                            <>
                              {canManageManagers && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onRemoveMember(member.id)}
                                disabled={isPending}
                              >
                                <Trash2 className="size-4 mr-2" />
                                {t("membersList.remove")}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null
                  }
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
