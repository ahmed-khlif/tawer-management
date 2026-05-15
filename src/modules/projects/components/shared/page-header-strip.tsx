"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type HeaderMetricTone =
  | "default"
  | "muted"
  | "primary"
  | "success"
  | "running"
  | "info"
  | "warning"
  | "destructive"
  // Legacy chart-* tones — kept for backward compatibility but mapped onto the
  // semantic palette below so the new status-tokens.css drives every chip.
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-5";

export interface HeaderMetric {
  /** Lucide icon component (preferred) or any ReactNode rendered before the value. */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  /** Pre-formatted value, e.g. "12 total" or "running". You can also pass `value` + `label`. */
  label: React.ReactNode;
  /** Optional separate value rendered right after the icon and before the label. */
  value?: React.ReactNode;
  
  /** Color tone — drives badge background / border / text color. Defaults to `default`. */
  tone?: HeaderMetricTone;
  /** Optional click handler — renders the badge as a button. */
  onClick?: () => void;
  /** Optional explicit key (when using non-string labels). */
  key?: string;
  /** When true, the metric is hidden. Convenient to inline conditionals. */
  hidden?: boolean;
}

export interface PageHeaderStripProps {
  /** Main icon — rendered in the rounded-square media slot. */
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  /** Title (h2). */
  title: React.ReactNode;
  /** One-line description. */
  description?: React.ReactNode;
  /** At-a-glance metric chips on the right. Falsy entries are skipped. */
  metrics?: Array<HeaderMetric | false | null | undefined>;
  /** Primary actions (Buttons, etc.) rendered after the metric chips. */
  actions?: React.ReactNode;
  /** Override icon tile color tone (defaults to primary). */
  iconTone?: "primary" | "muted" | "destructive";
  /** Extra classes for the outer container. */
  className?: string;
}

const METRIC_TONE_CLASSES: Record<HeaderMetricTone, string> = {
  default:
    "border-border bg-secondary text-secondary-foreground font-normal",
  muted:
    "border-border bg-muted text-muted-foreground font-normal",
  primary:
    "border-primary/30 bg-primary/10 text-primary font-normal",
  success: "pm-tone-success font-normal",
  running: "pm-tone-running font-normal",
  info: "pm-tone-info font-normal",
  warning: "pm-tone-warning font-normal",
  destructive:
    "border-destructive/30 bg-destructive/10 text-destructive font-normal",
  // Legacy chart-* aliases — map onto the semantic tone closest in meaning.
  "chart-1": "pm-tone-running font-normal",
  "chart-2": "pm-tone-info font-normal",
  "chart-3": "pm-tone-warning font-normal",
  "chart-5": "pm-tone-success font-normal",
};

const ICON_TONE_CLASSES: Record<
  NonNullable<PageHeaderStripProps["iconTone"]>,
  string
> = {
  primary: "bg-primary/10 text-primary",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

/**
 * Project-wide page header strip used at the top of list / dashboard tabs.
 *
 * Layout:
 *   [icon]  Title              metric • metric • metric   [actions]
 *           Description
 *
 * The component intentionally mirrors the pattern that's been repeated across
 * Sprints, Milestones, Epics, Members, Backlog, Analytics and AI Insights —
 * any future tab can adopt it in a single line.
 */
export function PageHeaderStrip({
  icon: Icon,
  title,
  description,
  metrics,
  actions,
  iconTone = "primary",
  className,
}: PageHeaderStripProps) {
  const visibleMetrics = (metrics ?? []).filter(
    (m): m is HeaderMetric => Boolean(m) && !(m as HeaderMetric).hidden,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg shrink-0",
            ICON_TONE_CLASSES[iconTone],
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-none">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {(visibleMetrics.length > 0 || actions) ? (
        <div className="flex flex-wrap items-center gap-2">
          {visibleMetrics.map((metric, i) => {
            const MetricIcon = metric.icon;
            const tone = metric.tone ?? "default";
            const content = (
              <span className="flex items-center gap-1.5">
                {MetricIcon ? <MetricIcon className="size-3" /> : null}
                {metric.value !== undefined ? (
                  <>
                  <span className="font-semibold">{metric.value}</span>
                  <span>{metric.label}</span>                  
                  </>

                ) : (
                  <span>{metric.label}</span>
                )}
              </span>
            );
            const baseClass = cn(
              "gap-1.5",
              METRIC_TONE_CLASSES[tone],
              metric.onClick &&
                "cursor-pointer hover:brightness-105 active:brightness-95",
            );
            const key = metric.key ?? String(i);
            return metric.onClick ? (
              <button
                key={key}
                type="button"
                onClick={metric.onClick}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md"
              >
                <Badge variant="outline" className={baseClass}>
                  {content}
                </Badge>
              </button>
            ) : (
              <Badge key={key} variant="outline" className={baseClass}>
                {content}
              </Badge>
            );
          })}
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
