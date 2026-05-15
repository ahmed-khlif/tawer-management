"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type MetricTone =
  | "default"
  | "primary"
  | "running"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export interface MetricCardProps {
  /** Lucide icon (preferred) or any component accepting `className`. */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  /** Short, tracked uppercase label rendered above the value. */
  label: React.ReactNode;
  /** Headline value. Strings, numbers and rich nodes all work. */
  value: React.ReactNode;
  /** Optional context line below the value (e.g. "12 assigned"). */
  hint?: React.ReactNode;
  /**
   * Optional trend indicator. Positive renders up arrow + success tone,
   * negative renders down arrow + destructive tone, zero renders muted.
   * Pass a string ("+12%", "-3", "stable") or a number (e.g. 12).
   */
  trend?: { value: React.ReactNode; direction: "up" | "down" | "flat" };
  /** Coloring used for icon tile and (optionally) value emphasis. */
  tone?: MetricTone;
  /** Render an emphasized colored value, not just the icon tile. */
  emphasize?: boolean;
  /** Optional 0–100 progress bar rendered at the bottom of the card. */
  progress?: number;
  /** Click handler — turns the card into a clickable button. */
  onClick?: () => void;
  /** Show skeleton loaders instead of the value/hint. */
  loading?: boolean;
  /** Density preset. `comfy` (default) suits dashboards, `compact` for sidebars. */
  density?: "comfy" | "compact";
  /** Additional classes appended to the outer card. */
  className?: string;
  /** Optional aria label override (defaults to plain text label). */
  ariaLabel?: string;
}

const TONE_TILE: Record<MetricTone, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  running: "pm-tone-running",
  info: "pm-tone-info",
  success: "pm-tone-success",
  warning: "pm-tone-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const TONE_VALUE: Record<MetricTone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  running: "text-[color:var(--pm-tone-running-fg)]",
  info: "text-[color:var(--pm-tone-info-fg)]",
  success: "text-[color:var(--pm-tone-success-fg)]",
  warning: "text-[color:var(--pm-tone-warning-fg)]",
  destructive: "text-destructive",
};

const TONE_ACCENT: Record<MetricTone, string> = {
  default: "before:bg-border",
  primary: "before:bg-primary/40",
  running: "before:bg-[color:var(--pm-tone-running-border)]",
  info: "before:bg-[color:var(--pm-tone-info-border)]",
  success: "before:bg-[color:var(--pm-tone-success-border)]",
  warning: "before:bg-[color:var(--pm-tone-warning-border)]",
  destructive: "before:bg-destructive/50",
};

const TONE_GLOW: Record<MetricTone, string> = {
  default: "",
  primary: "shadow-[0_0_0_1px_hsl(var(--primary)/0.08)]",
  running: "",
  info: "",
  success: "",
  warning: "",
  destructive: "shadow-[0_0_0_1px_hsl(var(--destructive)/0.1)]",
};

function TrendBadge({ trend, tone }: { trend: NonNullable<MetricCardProps["trend"]>; tone: MetricTone }) {
  const Icon =
    trend.direction === "up"
      ? ArrowUpRight
      : trend.direction === "down"
        ? ArrowDownRight
        : Minus;

  const className = cn(
    "inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none",
    trend.direction === "up" && "pm-tone-success",
    trend.direction === "down" && "border-destructive/30 bg-destructive/10 text-destructive",
    trend.direction === "flat" && "border-muted-foreground/25 bg-muted text-muted-foreground",
    tone === "destructive" && trend.direction === "up" && "pm-tone-warning",
  );

  return (
    <span className={className}>
      <Icon className="size-3" aria-hidden />
      {trend.value}
    </span>
  );
}

/**
 * Project-wide unified metric card.
 *
 * Replaces the various ad-hoc Stat / MetricTile / Card+CardTitle patterns that
 * accumulated across overview, AI insights, productivity, and assigned-tasks
 * pages. Same component, multiple densities and tones.
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  tone = "default",
  emphasize = false,
  progress,
  onClick,
  loading = false,
  density = "comfy",
  className,
  ariaLabel,
}: MetricCardProps) {
  const isCompact = density === "compact";
  const interactive = Boolean(onClick);

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <span
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-md",
                isCompact ? "size-7" : "size-8",
                TONE_TILE[tone],
              )}
            >
              <Icon className={isCompact ? "size-3.5" : "size-4"} />
            </span>
          ) : null}
          <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
        {trend && !loading ? <TrendBadge trend={trend} tone={tone} /> : null}
      </div>

      <div className="space-y-0.5">
        {loading ? (
          <Skeleton className={cn("h-7 w-24", isCompact && "h-6 w-20")} />
        ) : (
          <span
            className={cn(
              "block truncate font-semibold leading-tight",
              isCompact ? "text-lg" : "text-2xl",
              emphasize ? TONE_VALUE[tone] : "text-foreground",
            )}
          >
            {value}
          </span>
        )}
        {hint && !loading ? (
          <span className="block truncate text-xs text-muted-foreground">{hint}</span>
        ) : null}
        {hint && loading ? <Skeleton className="h-3 w-20" /> : null}
      </div>

      {typeof progress === "number" && !loading ? (
        <Progress
          value={Math.max(0, Math.min(100, progress))}
          className={isCompact ? "h-1" : "h-1.5"}
        />
      ) : null}
    </>
  );

  return (
    <Card
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      aria-label={
        ariaLabel ?? (typeof label === "string" ? label : undefined)
      }
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden border bg-card transition-shadow",
        isCompact ? "p-3" : "p-4",
        TONE_GLOW[tone],
        // left accent bar
        "before:absolute before:left-0 before:top-3 before:bottom-3 before:w-0.5 before:rounded-r",
        TONE_ACCENT[tone],
        interactive && "cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
    >
      {content}
    </Card>
  );
}

export default MetricCard;
