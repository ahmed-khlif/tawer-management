"use client";

import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  ExternalLink,
  Mail,
  MailCheck,
  MailX,
  MoreHorizontal,
  RefreshCw,
  ShieldX,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ListCard } from "../../shared/list-card";
import { ProjectInvitation as ProjectInvitationType } from "../../../types/projects";

interface InvitationsListCardProps {
  invitations: ProjectInvitationType[];
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
  isPending: boolean;
  canManage: boolean;
}

type StatusKey =
  | "pending"
  | "accepted"
  | "expired"
  | "expiring"
  | "revoked"
  | "failed";

type IndicatorVariant = "success" | "danger" | "warning" | null;

interface ResolvedStatus {
  key: StatusKey;
  label: string;
  badgeClass: string;
  indicator: IndicatorVariant;
  Icon: React.ComponentType<{ className?: string }>;
}

function resolveStatus(
  rawStatus: string | undefined,
  expiresAt: Date,
): ResolvedStatus {
  const now = Date.now();
  const exp = expiresAt.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysToExpiry = (exp - now) / msPerDay;
  const normalized = (rawStatus ?? "PENDING").toUpperCase();

  if (normalized === "ACCEPTED" || normalized === "JOINED") {
    return {
      key: "accepted",
      label: "Accepted",
      badgeClass: "pm-tone-success border",
      indicator: "success",
      Icon: CheckCircle2,
    };
  }
  if (normalized === "REVOKED" || normalized === "CANCELLED") {
    return {
      key: "revoked",
      label: "Revoked",
      badgeClass: "border-muted-foreground/30 bg-muted text-muted-foreground",
      indicator: null,
      Icon: ShieldX,
    };
  }
  if (normalized === "FAILED" || normalized === "ERROR") {
    return {
      key: "failed",
      label: "Failed",
      badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
      indicator: "danger",
      Icon: MailX,
    };
  }
  if (normalized === "EXPIRED" || daysToExpiry <= 0) {
    return {
      key: "expired",
      label: "Expired",
      badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
      indicator: "danger",
      Icon: TriangleAlert,
    };
  }
  if (daysToExpiry <= 3) {
    return {
      key: "expiring",
      label: "Expiring soon",
      badgeClass: "pm-tone-warning border",
      indicator: "warning",
      Icon: Clock,
    };
  }
  return {
    key: "pending",
    label: "Pending",
    badgeClass: "pm-tone-info border",
    indicator: "warning",
    Icon: MailCheck,
  };
}

function relativeTimeFromNow(target: Date): string {
  const now = Date.now();
  const diffMs = target.getTime() - now;
  const absMs = Math.abs(diffMs);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const future = diffMs >= 0;

  let value: number;
  let unit: string;
  if (absMs < hour) {
    value = Math.max(1, Math.round(absMs / minute));
    unit = value === 1 ? "minute" : "minutes";
  } else if (absMs < day) {
    value = Math.max(1, Math.round(absMs / hour));
    unit = value === 1 ? "hour" : "hours";
  } else if (absMs < 30 * day) {
    value = Math.max(1, Math.round(absMs / day));
    unit = value === 1 ? "day" : "days";
  } else {
    value = Math.max(1, Math.round(absMs / (30 * day)));
    unit = value === 1 ? "month" : "months";
  }
  return future ? `in ${value} ${unit}` : `${value} ${unit} ago`;
}

function dateToShort(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InvitationsListCard({
  invitations,
  onResend,
  onRevoke,
  isPending,
  canManage,
}: InvitationsListCardProps) {
  const t = useTranslations("modules.projects.project.details");
  const total = invitations.length;
  const pendingCount = invitations.filter(
    (i) => resolveStatus(i.status, new Date(i.expiresAt)).key === "pending",
  ).length;
  const expiringCount = invitations.filter(
    (i) => resolveStatus(i.status, new Date(i.expiresAt)).key === "expiring",
  ).length;
  const expiredCount = invitations.filter(
    (i) => resolveStatus(i.status, new Date(i.expiresAt)).key === "expired",
  ).length;

  const handleCopyEmail = (email: string) => {
    void navigator.clipboard.writeText(email);
    toast.success("Email copied");
  };

  return (
    <div className="space-y-4">
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">
              {t("invitationsList.title")}
            </h3>
            <Badge variant="secondary" className="font-normal h-5 px-1.5 text-[10px]">
              {total}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {pendingCount > 0 ? (
              <Badge
                variant="outline"
                className="gap-1 pm-tone-info border font-normal text-[10px] h-5"
              >
                <MailCheck className="size-3" />
                {pendingCount} pending
              </Badge>
            ) : null}
            {expiringCount > 0 ? (
              <Badge
                variant="outline"
                className="gap-1 pm-tone-warning border font-normal text-[10px] h-5"
              >
                <Clock className="size-3" />
                {expiringCount} expiring
              </Badge>
            ) : null}
            {expiredCount > 0 ? (
              <Badge
                variant="outline"
                className="gap-1 border-destructive/30 bg-destructive/10 text-destructive font-normal text-[10px] h-5"
              >
                <TriangleAlert className="size-3" />
                {expiredCount} expired
              </Badge>
            ) : null}
          </div>
        </div>
      )}

      {invitations.length === 0 ? (
        <Empty className="border-dashed border bg-muted/30">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Mail className="size-5" />
            </EmptyMedia>
            <EmptyTitle>
              {t("invitationsList.empty", {
                defaultValue: "No pending invitations",
              })}
            </EmptyTitle>
            <EmptyDescription>
              Invite teammates by email to grant them access to this project.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {invitations.map((invite) => {
            const expiresAt = new Date(invite.expiresAt);
            const status = resolveStatus(invite.status, expiresAt);
            const expiryRelative = relativeTimeFromNow(expiresAt);
            const expiryAbsolute = dateToShort(expiresAt);
            const isExpired = status.key === "expired";
            const StatusIcon = status.Icon;

            return (
              <div
                key={invite.id}
                className={cn(
                  status.key === "expiring" &&
                    "border-amber-500/30 bg-amber-500/[0.04]",
                  status.key === "expired" &&
                    "border-destructive/20 bg-destructive/[0.03]",
                )}
              >
                <ListCard
                  avatar={
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs uppercase">
                      {invite.email.substring(0, 2)}
                    </AvatarFallback>
                    {status.indicator ? (
                      <AvatarIndicator variant={status.indicator} />
                    ) : null}
                  </Avatar>
                }
                primary={
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate font-medium">
                      {invite.email}
                    </span>
                    {invite.isManager ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center justify-center rounded-md bg-primary/10 p-0.5 text-primary">
                            <Crown className="size-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Manager invitation</TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                }
                secondary={
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-1",
                        isExpired
                          ? "border-destructive/20 bg-destructive/5 text-destructive"
                          : status.key === "expiring"
                            ? "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                            : "border-border/70 bg-background text-muted-foreground",
                      )}
                    >
                      <CalendarClock className="size-3" />
                      {isExpired ? "Expired " : "Expires "}
                      {expiryRelative}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                          <ExternalLink className="size-3" />
                          {expiryAbsolute}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Sent {relativeTimeFromNow(new Date(invite.createdAt))}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                }
                badge={
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 text-[10px] h-5 font-normal",
                      status.badgeClass,
                    )}
                  >
                    <StatusIcon className="size-3" />
                    {status.label}
                  </Badge>
                }
                actions={
                  canManage ? (
                    <div className="flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleCopyEmail(invite.email)}
                            aria-label="Copy email"
                          >
                            <Copy className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy email</TooltipContent>
                      </Tooltip>
                      {!isExpired && status.key !== "revoked" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => onResend(invite.id)}
                              disabled={isPending}
                              aria-label="Resend"
                            >
                              <RefreshCw className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {t("invitationsList.resend", {
                              defaultValue: "Resend",
                            })}
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label="More actions"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>More actions</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onResend(invite.id)}
                            disabled={
                              isPending ||
                              isExpired ||
                              status.key === "revoked"
                            }
                          >
                            <RefreshCw className="size-4 mr-2" />
                            {t("invitationsList.resend", {
                              defaultValue: "Resend",
                            })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onRevoke(invite.id)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            {t("invitationsList.cancel")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : null
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
