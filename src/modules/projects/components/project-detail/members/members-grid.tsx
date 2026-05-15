"use client";

import React from "react";
import {
  MoreHorizontal,
  Mail,
  ShieldCheck,
  Trash2,
  Crown,
  Plus,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Avatar,
  AvatarFallback,
  AvatarIndicator,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ProjectMember } from "../../../types/projects";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { formatUserRoleLabel } from "../../../utils/format-user-role";
import {
  userRoleBadgeClass,
  userRoleDotClass,
  userRoleStyle,
} from "../../../utils/badges/user-role-badges";

interface MembersGridProps {
  members: ProjectMember[];
  tasks?: ProjectTaskType[];
  onUpdateRole: (memberId: string, data: { isManager: boolean }) => void;
  onRemoveMember: (memberId: string) => void;
  onAddMember: () => void;
  isPending: boolean;
  tasksAreLoading?: boolean;
  canRemoveMember: boolean;
  canManageManagers: boolean;
  canManageMembers: boolean;
  canRemoveLastManager: boolean;
  canViewEmployeeAnalytics: boolean;
}

export function MembersGrid({
  members,
  tasks = [],
  onUpdateRole,
  onRemoveMember,
  onAddMember,
  isPending,
  tasksAreLoading,
  canRemoveMember,
  canManageManagers,
  canManageMembers,
  canRemoveLastManager,
  canViewEmployeeAnalytics,
}: MembersGridProps) {
  const t = useTranslations("modules.projects.project.details");
  const managerCount = members.filter((m) => m.isManager).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {canManageMembers && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={onAddMember}
              className="group relative flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 transition-all hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
                <Plus className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-medium text-muted-foreground transition-colors group-hover:text-primary">
                  {t("membersList.addMember", { defaultValue: "Add Member" })}
                </span>
                <p className="px-6 text-center text-xs text-muted-foreground/60">
                  {t("membersList.addMemberHint", {
                    defaultValue: "Collaborate with your team",
                  })}
                </p>
              </div>
            </button>
          </motion.div>
        )}

        {members.map((member) => {
          const memberTasks = tasks.filter((task) => task.assigneeId === member.userId);
          const completedTasks = memberTasks.filter((task) => 
            ["DONE", "COMPLETED"].includes(task.status?.toUpperCase() ?? "")
          ).length;
          const totalTasks = memberTasks.length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <MemberCard
              key={member.id}
              member={member}
              onUpdateRole={onUpdateRole}
              onRemoveMember={onRemoveMember}
              managerCount={managerCount}
              isPending={isPending}
              canRemoveMember={canRemoveMember}
              canManageManagers={canManageManagers}
              canRemoveLastManager={canRemoveLastManager}
              canViewEmployeeAnalytics={canViewEmployeeAnalytics}
              taskStats={{
                total: totalTasks,
                completed: completedTasks,
                progress,
              }}
              t={t}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function MemberCard({
  member,
  onUpdateRole,
  onRemoveMember,
  managerCount,
  isPending,
  canRemoveMember,
  canManageManagers,
  canRemoveLastManager,
  canViewEmployeeAnalytics,
  taskStats,
  t,
}: {
  member: ProjectMember;
  onUpdateRole: (memberId: string, data: { isManager: boolean }) => void;
  onRemoveMember: (memberId: string) => void;
  managerCount: number;
  isPending: boolean;
  canRemoveMember: boolean;
  canManageManagers: boolean;
  canRemoveLastManager: boolean;
  canViewEmployeeAnalytics: boolean;
  taskStats: { total: number; completed: number; progress: number };
  t: any;
}) {
  const isLastManager = member.isManager && managerCount <= 1;
  const allowDemote = canManageManagers && !isLastManager;
  const allowRemove =
    ((canRemoveMember && !member.isManager) ||
      (canManageManagers && (!isLastManager || canRemoveLastManager)));

  const displayName = member.user?.name || member.userId;
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s: string) => s[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex flex-col items-center rounded-xl border bg-card p-5 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 overflow-hidden",
        member.isManager && "bg-primary/[0.01]"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="absolute right-2 top-2 z-10">
        {allowDemote || allowRemove ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm border shadow-sm"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canManageManagers && (
                <DropdownMenuItem
                  onClick={() =>
                    onUpdateRole(member.id, {
                      isManager: !member.isManager,
                    })
                  }
                disabled={isPending || (member.isManager && isLastManager)}
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
        ) : null}
      </div>

      <div className="mb-4 relative">
        <Avatar className="size-20 border-2 border-background ring-2 ring-muted group-hover:ring-primary/20 transition-all shadow-sm">
          <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
            {initials}
          </AvatarFallback>
          <AvatarIndicator
            variant={member.isManager ? "success" : undefined}
            position="bottom-end"
            className="size-5 border-2 border-background shadow-sm"
          />
        </Avatar>
        {member.isManager && (
          <div className="absolute -top-1 -left-1 rounded-full bg-primary p-1.5 text-white shadow-lg ring-2 ring-background animate-in fade-in zoom-in duration-300">
            <Crown className="size-3" />
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-col items-center gap-1 min-w-0 w-full">
        <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {displayName}
        </h3>
        <p className="text-xs text-muted-foreground/70 line-clamp-1 flex items-center gap-1 justify-center">
          <Mail className="size-3" />
          {member.user?.email || "No email"}
        </p>
      </div>

      <div className="mb-5 flex flex-wrap justify-center gap-1.5">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] h-5 font-bold uppercase tracking-wider px-2",
            member.isManager
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted/50 text-muted-foreground border-muted/50",
          )}
        >
          {member.isManager ? t("membersList.manager") : t("membersList.member")}
        </Badge>
        {(member.userRoles ?? []).slice(0, 1).map((role) => (
          <Badge
            key={role}
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1 text-[10px] h-5 px-2 font-bold uppercase tracking-wider",
              userRoleBadgeClass(),
            )}
            style={userRoleStyle(role)}
          >
            <span className={userRoleDotClass()} aria-hidden />
            {formatUserRoleLabel(role)}
          </Badge>
        ))}
      </div>

      <div className="mt-auto w-full space-y-3 pt-4 border-t border-border/40">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={cn("size-3.5", taskStats.progress > 0 ? "text-primary" : "text-muted-foreground/40")} />
            Task Progress
          </span>
          <span className="text-foreground">{taskStats.progress}%</span>
        </div>
        <Progress 
          value={taskStats.progress} 
          className={cn(
            "h-1.5 bg-muted/50",
            taskStats.progress === 100 && "bg-emerald-500/20"
          )} 
        />
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/70">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            <span>Assigned</span>
          </div>
          <span className="text-foreground/80">{taskStats.completed}/{taskStats.total} Tasks</span>
        </div>
        {canViewEmployeeAnalytics ? (
          <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
            <Link href={`/dashboard/analytics/employees/${member.userId}`}>
              <Activity className="size-4" />
              View Employee Analytics
            </Link>
          </Button>
        ) : null}
      </div>
    </motion.div>
  );
}
