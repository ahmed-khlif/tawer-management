"use client";

import {
  RadialBar,
  RadialBarChart,
  Area,
  AreaChart,
  PolarAngleAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type SparkPoint = { label: string; value: number };

interface InsightMetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "info";
  trend?: string;
  progress?: number;
  sparkline?: SparkPoint[];
}

const toneMap = {
  default: {
    tile: "bg-primary/10 text-primary",
    accent: "var(--pm-project-running-accent)",
  },
  success: {
    tile: "pm-tone-success",
    accent: "var(--pm-project-completed-accent)",
  },
  warning: {
    tile: "pm-tone-warning",
    accent: "var(--pm-project-stopped-accent)",
  },
  info: {
    tile: "pm-tone-info",
    accent: "var(--pm-tone-info-fg)",
  },
} as const;

export function InsightMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  trend,
  progress,
  sparkline,
}: InsightMetricCardProps) {
  const palette = toneMap[tone];

  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <CardContent className="relative flex min-h-[172px] flex-col justify-between p-5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-80"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${palette.accent} 10%, transparent) 0%, transparent 100%)`,
          }}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="relative z-10 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
            <p className="text-3xl font-semibold leading-none">{value}</p>
            {hint ? (
              <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </div>

          <div className={cn("relative z-10 rounded-2xl p-3 shadow-sm", palette.tile)}>
            <Icon className="size-4" />
          </div>
        </div>

        <div className="relative z-10 mt-5 flex items-end justify-between gap-3">
          {typeof progress === "number" ? (
            <div className="size-[72px] shrink-0">
              <ChartContainer
                config={{ value: { label, color: palette.accent } }}
                className="aspect-square"
              >
                <RadialBarChart
                  data={[{ name: label, value: Math.max(0, Math.min(100, progress)) }]}
                  startAngle={90}
                  endAngle={-270}
                  innerRadius="70%"
                  outerRadius="100%"
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={8}
                    fill="var(--color-value)"
                  />
                </RadialBarChart>
              </ChartContainer>
            </div>
          ) : null}

          {sparkline?.length ? (
            <div className="h-[72px] flex-1">
              <ChartContainer
                config={{ value: { label, color: palette.accent } }}
                className="h-full w-full"
              >
                <AreaChart data={sparkline}>
                  <defs>
                    <linearGradient id={`metric-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={palette.accent} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={palette.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent labelKey="label" />}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={palette.accent}
                    strokeWidth={2}
                    fill={`url(#metric-${label})`}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {trend ? (
            <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
              {trend}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default InsightMetricCard;
