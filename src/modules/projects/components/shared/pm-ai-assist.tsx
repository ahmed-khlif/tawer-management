"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PmAiAction {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
  loading?: boolean;
  priority?: boolean;
}

export function PmAiAssistPanel({
  title = "AI Assist",
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions: PmAiAction[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-muted/30 p-4 space-y-3", className)}>
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <div key={action.id} className="space-y-1">
            <Button
              type="button"
              size="sm"
              variant={action.priority ? "default" : "outline"}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className="rounded-full"
            >
              {action.loading ? "Working..." : action.label}
            </Button>
            {action.disabled && action.hint ? (
              <p className="max-w-[14rem] text-[11px] text-muted-foreground">{action.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      {children}
    </div>
  );
}

export function PmAiSuggestionCard({
  title,
  badge,
  children,
  onDismiss,
  footer,
  className,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  onDismiss?: () => void;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-primary/25 bg-background p-4 space-y-3 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{title}</p>
            {badge ? <Badge variant="outline">{badge}</Badge> : null}
          </div>
        </div>
        {onDismiss ? (
          <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        ) : null}
      </div>
      <div className="space-y-3 text-sm">{children}</div>
      {footer ? <div className="flex flex-wrap justify-end gap-2">{footer}</div> : null}
    </div>
  );
}
