"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EmptyState } from "../../shared/empty-state";

interface TeamPerformanceDatum {
  name: string;
  planned: number;
  actual: number;
}

interface TeamPerformanceChartProps {
  title: string;
  description: string;
  data: TeamPerformanceDatum[];
  plannedLabel: string;
  actualLabel: string;
}

export function TeamPerformanceChart({
  title,
  description,
  data,
  plannedLabel,
  actualLabel,
}: TeamPerformanceChartProps) {
  const totalPlanned = data.reduce((sum, item) => sum + item.planned, 0);
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const hasMeaningfulData =
    data.length > 0 && data.some((item) => item.planned > 0 || item.actual > 0);

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <div
        className="absolute inset-0 opacity-75"
        style={{
          background:
            "linear-gradient(145deg, color-mix(in srgb, var(--pm-project-pending-accent) 7%, transparent) 0%, transparent 42%, color-mix(in srgb, var(--pm-project-running-accent) 9%, transparent) 100%)",
        }}
      />
      <CardHeader className="relative">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/85 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {plannedLabel}
            </p>
            <p className="mt-1 text-2xl font-semibold">{totalPlanned}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/85 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {actualLabel}
            </p>
            <p className="mt-1 text-2xl font-semibold">{totalActual}</p>
          </div>
        </div>
        {hasMeaningfulData ? (
          <ChartContainer
            config={{
              planned: {
                label: plannedLabel,
                color:
                  "color-mix(in srgb, var(--pm-project-pending-accent) 48%, white)",
              },
              actual: {
                label: actualLabel,
                color: "var(--pm-project-running-accent)",
              },
            }}
            className="h-[320px] w-full"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 20, left: 12, bottom: 8 }}
              barCategoryGap={14}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="color-mix(in srgb, var(--pm-tone-info-border) 45%, transparent)"
              />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={150}
                tickFormatter={(value: string) =>
                  value.length > 18 ? `${value.slice(0, 18)}...` : value
                }
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelKey="name" />}
              />
              <ChartLegend
                verticalAlign="top"
                align="right"
                content={<ChartLegendContent />}
              />
              <Bar
                dataKey="planned"
                fill="var(--color-planned)"
                barSize={14}
                radius={[0, 10, 10, 0]}
              />
              <Bar
                dataKey="actual"
                fill="var(--color-actual)"
                barSize={14}
                radius={[0, 10, 10, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-background/70 p-6">
            <EmptyState
              icon={Users}
              message="No sprint load to compare yet"
              description="Capacity and committed points will appear here once the selected members have active sprint planning data."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TeamPerformanceChart;
