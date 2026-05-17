"use client";

import { Pie, PieChart, Cell } from "recharts";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EmptyState } from "../../shared/empty-state";

interface StatusDatum {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface StatusDonutChartProps {
  title: string;
  description: string;
  data: StatusDatum[];
}

export function StatusDonutChart({
  title,
  description,
  data,
}: StatusDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const singleStatus = data.length === 1 ? data[0] : null;
  const config = Object.fromEntries(
    data.map((item) => [
      item.key,
      {
        label: item.label,
        color: item.color,
      },
    ]),
  );

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "linear-gradient(140deg, color-mix(in srgb, var(--pm-project-running-accent) 8%, transparent) 0%, transparent 48%, color-mix(in srgb, var(--pm-project-completed-accent) 9%, transparent) 100%)",
        }}
      />
      <CardHeader className="relative">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="relative">
        {total === 0 ? (
          <EmptyState
            icon={Activity}
            message="No task status data yet"
            description="Tasks need active workflow data before this project-wide status chart becomes meaningful."
          />
          ) : singleStatus ? (
          <div className="space-y-5">
            <div className="mx-auto flex w-full max-w-[300px] items-center justify-center rounded-[28px] border border-border/60 bg-background/85 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              <ChartContainer
                config={config}
                className="h-[280px] w-full max-w-[280px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="key" />} />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={74}
                    outerRadius={106}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-3xl font-semibold"
                  >
                    {total}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[11px] font-medium uppercase tracking-[0.18em]"
                  >
                    Total Tasks
                  </text>
                </PieChart>
              </ChartContainer>
            </div>

            <div
              className="rounded-[28px] border px-5 py-5 shadow-sm"
              style={{
                background: `linear-gradient(160deg, color-mix(in srgb, ${singleStatus.color} 12%, var(--background)) 0%, color-mix(in srgb, ${singleStatus.color} 5%, transparent) 100%)`,
                borderColor: `color-mix(in srgb, ${singleStatus.color} 24%, var(--border))`,
              }}
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: singleStatus.color }}
                  />
                  <p className="text-base font-semibold sm:text-lg">{singleStatus.label}</p>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Current share
                    </p>
                    <p className="mt-1 text-3xl font-semibold">100%</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Tasks in status
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                      {singleStatus.value}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Distribution
                    </p>
                    <p className="mt-1 text-2xl font-semibold">Single state</p>
                  </div>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  All tracked work in this project currently falls into one active status, which usually means the board is still early, highly focused, or waiting on the next workflow transition.
                </p>

                <div className="h-2.5 rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "100%",
                      backgroundColor: singleStatus.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 2xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)] 2xl:items-center">
            <div className="mx-auto flex w-full max-w-[300px] items-center justify-center rounded-[28px] border border-border/60 bg-background/85 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              <ChartContainer
                config={config}
                className="h-[280px] w-full max-w-[280px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="key" />} />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={74}
                    outerRadius={106}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-3xl font-semibold"
                  >
                    {total}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[11px] font-medium uppercase tracking-[0.18em]"
                  >
                    Total Tasks
                  </text>
                </PieChart>
              </ChartContainer>
            </div>

            <div className="space-y-3">
              {data.map((item) => {
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

                return (
                  <div
                    key={item.key}
                    className="flex flex-col gap-3 rounded-2xl border px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    style={{
                      background: `color-mix(in srgb, ${item.color} 8%, var(--background))`,
                      borderColor: `color-mix(in srgb, ${item.color} 26%, var(--border))`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.value} tasks</p>
                      </div>
                    </div>
                    <div className="min-w-14 text-left sm:text-right">
                      <span className="text-sm font-semibold">{percent}%</span>
                      <div className="mt-2 h-1.5 rounded-full bg-black/5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatusDonutChart;
