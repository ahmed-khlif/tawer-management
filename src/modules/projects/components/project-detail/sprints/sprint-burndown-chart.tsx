"use client";

import { Activity, Flag, TrendingDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { SprintBurndown } from "@/modules/projects/types/project-sprints";
import { cn } from "@/lib/utils";

interface SprintBurndownChartProps {
  burndown: SprintBurndown;
}

function BurndownTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number | null; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const ideal = payload.find((item) => item.dataKey === "idealRemaining")?.value;
  const actual = payload.find((item) => item.dataKey === "actualRemaining")?.value;

  return (
    <div className="rounded-2xl border border-border/70 bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Ideal remaining</span>
          <span className="font-medium">{ideal ?? "—"} pts</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Actual remaining</span>
          <span className="font-medium">{actual ?? "—"} pts</span>
        </div>
      </div>
    </div>
  );
}

export default function SprintBurndownChart({ burndown }: SprintBurndownChartProps) {
  const lastPoint = burndown.chartData[burndown.chartData.length - 1];
  const drift =
    typeof lastPoint?.actualRemaining === "number"
      ? lastPoint.actualRemaining - lastPoint.idealRemaining
      : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flag className="size-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Scope</p>
          </div>
          <p className="mt-2 text-xl font-semibold">{burndown.totalPoints} pts</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {burndown.totalTasks} tasks planned in this sprint.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="size-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Delivered</p>
          </div>
          <p className="mt-2 text-xl font-semibold">{burndown.completedPoints} pts</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {burndown.completedTasks} tasks completed so far.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingDown className="size-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Drift</p>
          </div>
          <p className="mt-2 text-xl font-semibold">
            {drift === null ? "—" : `${drift > 0 ? "+" : ""}${drift} pts`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Difference between ideal and actual remaining scope.
          </p>
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-border/60 bg-background/60 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Burn path</p>
            <p className="text-xs text-muted-foreground">
              Follow the actual burn line against the ideal sprint path.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full text-[10px] font-semibold uppercase tracking-wide">
              <span className="mr-1.5 size-2 rounded-full bg-[var(--pm-progress-track)]" />
              Ideal
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px] font-semibold uppercase tracking-wide">
              <span className="mr-1.5 size-2 rounded-full bg-[var(--pm-progress-fill-late)]" />
              Actual
            </Badge>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={burndown.chartData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.65)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <Tooltip content={<BurndownTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }} />
              <ReferenceLine
                y={0}
                stroke="hsl(var(--border))"
                strokeOpacity={0.7}
              />
              <Line
                type="monotone"
                dataKey="idealRemaining"
                stroke="var(--pm-progress-track)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="actualRemaining"
                stroke="var(--pm-progress-fill-late)"
                strokeWidth={3}
                dot={(props) => (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={3.5}
                    fill="var(--pm-progress-fill-late)"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    className={cn(props.payload?.actualRemaining == null && "hidden")}
                  />
                )}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
