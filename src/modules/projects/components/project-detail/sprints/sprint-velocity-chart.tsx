"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { SprintVelocity } from "@/modules/projects/types/project-sprints";

interface SprintVelocityChartProps {
  velocity: SprintVelocity;
}

const chartConfig = {
  capacity: {
    label: "Capacity",
    color: "var(--chart-3)",
  },
  completedPoints: {
    label: "Completed",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function SprintVelocityChart({
  velocity,
}: SprintVelocityChartProps) {
  const data = velocity.sprints.map((s, i) => ({
    ...s,
    capacity: s.capacity ?? 0,
    label: s.name?.length > 18 ? `${s.name.slice(0, 16)}…` : s.name || `S${i + 1}`,
  }));
  const showAvg =
    typeof velocity.averageVelocity === "number" &&
    velocity.averageVelocity > 0;

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[260px] w-full"
    >
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={32}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        {showAvg ? (
          <ReferenceLine
            y={velocity.averageVelocity}
            stroke="var(--chart-5)"
            strokeDasharray="4 4"
            label={{
              value: `Avg ${velocity.averageVelocity.toFixed(1)}`,
              position: "insideTopRight",
              fill: "var(--chart-5)",
              fontSize: 11,
            }}
          />
        ) : null}
        <Bar
          dataKey="capacity"
          fill="var(--color-capacity)"
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        />
        <Bar
          dataKey="completedPoints"
          fill="var(--color-completedPoints)"
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ChartContainer>
  );
}
