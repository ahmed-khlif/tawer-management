"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Flag,
  FolderKanban,
  ListChecks,
  MailX,
  RefreshCw,
  Sparkles,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReminderSummary } from "@/modules/reminders/types";
import { formatRRule } from "../utils/rrule-parser";

interface ReminderCardProps {
  reminder: ReminderSummary;
  /** Optional action buttons rendered in the card footer */
  actions?: React.ReactNode;
}

const ENTITY_ICONS: Record<string, LucideIcon> = {
  TASK: ListChecks,
  SPRINT: Sparkles,
  MILESTONE: Flag,
  PROJECT: FolderKanban,
  CUSTOM: Sparkles,
};

const STATUS_STYLE: Record<
  string,
  { className: string; Icon: LucideIcon; iconTone: string }
> = {
  PENDING: {
    className: "border-primary/30 bg-primary/10 text-primary",
    Icon: Clock,
    iconTone: "bg-primary/10 text-primary",
  },
  SENT: {
    className: "pm-tone-success border",
    Icon: CheckCircle2,
    iconTone: "pm-tone-success",
  },
  DISMISSED: {
    className: "border-border bg-muted text-muted-foreground",
    Icon: MailX,
    iconTone: "bg-muted text-muted-foreground",
  },
  FAILED: {
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    Icon: AlertTriangle,
    iconTone: "bg-destructive/10 text-destructive",
  },
  CANCELLED: {
    className: "border-border bg-muted text-muted-foreground",
    Icon: XCircle,
    iconTone: "bg-muted text-muted-foreground",
  },
};

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export default function ReminderCard({
  reminder,
  actions,
}: ReminderCardProps) {
  const reminderAt = new Date(reminder.reminderAt);
  const countdown = formatDistanceToNow(reminderAt, { addSuffix: true });
  const absolute = format(reminderAt, "PPpp");
  const status =
    STATUS_STYLE[reminder.status as string] ?? STATUS_STYLE.DISMISSED;
  const StatusIcon = status.Icon;
  const EntityIcon = ENTITY_ICONS[reminder.entityType] ?? Sparkles;
  const userName = reminder.user?.name ?? "—";

  return (
    <Card className="overflow-hidden border-border/70 bg-card/90 transition-all hover:-translate-y-px hover:border-primary/15 hover:shadow-md">
      <div className="flex items-start gap-3 p-4 sm:p-5">
        {/* Status icon tile */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            status.iconTone,
          )}
          aria-hidden="true"
        >
          <StatusIcon className="size-5" />
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 text-sm font-medium leading-snug sm:text-[15px]">
              {reminder.message || "Untitled reminder"}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn("h-5 gap-1 font-normal text-[10px]", status.className)}
              >
                <StatusIcon className="size-3" />
                {reminder.status}
              </Badge>
              {actions ? actions : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2 py-1 text-muted-foreground">
                  <CalendarClock className="size-3" />
                  {countdown}
                </span>
              </TooltipTrigger>
              <TooltipContent>{absolute}</TooltipContent>
            </Tooltip>
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
              <Badge variant="secondary" className="gap-1 font-normal">
                <EntityIcon className="size-3" />
                {reminder.entityType}
              </Badge>


            {reminder.isRecurring ? (
              <Badge
                variant="outline"
                className="gap-1 pm-tone-running border font-normal"
              >
                <RefreshCw className="size-3" />
                {reminder.recurrenceRule ? formatRRule(reminder.recurrenceRule) : "Recurring"}
              </Badge>
            ) : null}
            {reminder.user?.name ? (
              <span className="ms-auto inline-flex items-center gap-1.5 text-muted-foreground">
                <Avatar className="size-5 border bg-muted">
                  <AvatarFallback className="text-[10px] font-medium">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[140px]">{userName}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

    </Card>
  );
}
