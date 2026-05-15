"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

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
  totalLabel?: string;
  className?: string;
}

export function StatusDonutChart({
  title,
  description,
  data,
  totalLabel = "Total",
  className,
}: StatusDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
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
    <Card className={cn("border-border/60 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5", className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:items-center">
        <ChartContainer config={config} className="mx-auto h-[240px] w-full max-w-[240px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="key" />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={5}
              strokeWidth={0}
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-3xl font-bold"
            >
              {total}
            </text>
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              {totalLabel}
            </text>
          </PieChart>
        </ChartContainer>

        <div className="space-y-2.5">
          {data.map((item) => {
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

            return (
              <div
                key={item.key}
                className="group flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-3.5 py-3 transition-colors hover:bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="size-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground/80">{item.value} units</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums">{percent}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricComparisonChartProps {
  title: string;
  description: string;
  data: { label: string; actual: number; target: number }[];
  actualLabel: string;
  targetLabel: string;
  className?: string;
}

export function MetricComparisonChart({
  title,
  description,
  data,
  actualLabel,
  targetLabel,
  className,
}: MetricComparisonChartProps) {
  const config = {
    actual: { label: actualLabel, color: "var(--pm-tone-success-fg)" },
    target: { label: targetLabel, color: "var(--pm-tone-info-fg)" },
  };

  return (
    <Card className={cn("border-border/60 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5", className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis
              dataKey="label"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex flex-col">
                            <span className="text-[10px] uppercase text-muted-foreground">
                              {entry.name === "actual" ? actualLabel : targetLabel}
                            </span>
                            <span className="text-sm font-bold" style={{ color: entry.color }}>
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="target"
              fill={config.target.color}
              radius={[6, 6, 0, 0]}
              barSize={32}
              fillOpacity={0.15}
              stroke={config.target.color}
              strokeWidth={1}
              strokeDasharray="4 4"
              animationBegin={200}
              animationDuration={1200}
            />
            <Bar
              dataKey="actual"
              fill={config.actual.color}
              radius={[6, 6, 0, 0]}
              barSize={32}
              animationBegin={0}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
