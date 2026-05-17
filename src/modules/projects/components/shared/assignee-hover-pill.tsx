"use client";

import * as React from "react";
import { Crown, Mail, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { ResolvedAssignee } from "@/modules/projects/utils/resolve-assignee";

interface Props {
  assignee: ResolvedAssignee;
  /** Render mode. `compact` shows only the avatar; `inline` shows avatar + name. */
  variant?: "compact" | "inline";
  /** Diameter of the avatar (Tailwind size token). Defaults to `size-6`. */
  avatarSizeClass?: string;
  className?: string;
}

/**
 * Avatar + optional name with a hover card that surfaces email and roles.
 * Used on Kanban cards, task list rows, member rows, and the overview team panel
 * to keep assignee chrome consistent across the project management screens.
 */
export function AssigneeHoverPill({
  assignee,
  variant = "compact",
  avatarSizeClass = "size-6",
  className,
}: Props) {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 min-w-0 cursor-default",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className={cn(avatarSizeClass, "border bg-muted text-[10px]")}>
            {assignee.image ? (
              <AvatarImage src={assignee.image} alt={assignee.name} />
            ) : null}
            <AvatarFallback className="text-[10px] font-semibold">
              {assignee.initials || "?"}
            </AvatarFallback>
            {assignee.isManager ? (
              <AvatarIndicator
                variant="success"
                position="bottom-end"
                aria-label="Project manager"
              />
            ) : null}
          </Avatar>
          {variant === "inline" ? (
            <span className="text-xs text-muted-foreground truncate">
              {assignee.name}
            </span>
          ) : null}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-3" align="end">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 border bg-muted">
            {assignee.image ? (
              <AvatarImage src={assignee.image} alt={assignee.name} />
            ) : null}
            <AvatarFallback className="text-sm font-semibold">
              {assignee.initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm leading-tight truncate">
                {assignee.name}
              </span>
              {assignee.isManager ? (
                <Crown
                  className="size-3.5 shrink-0 text-primary"
                  aria-label="Project manager"
                />
              ) : null}
            </div>
            {assignee.email ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground truncate">
                <Mail className="size-3 shrink-0" />
                {assignee.email}
              </span>
            ) : null}
          </div>
        </div>
        {assignee.roles && assignee.roles.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <ShieldCheck className="size-3 text-muted-foreground" />
            {assignee.roles.map((role) => (
              <Badge
                key={role}
                variant="secondary"
                className="text-[10px] h-5 px-1.5 capitalize"
              >
                {role.toLowerCase().replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}
