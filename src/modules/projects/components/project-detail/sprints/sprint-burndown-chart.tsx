"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SprintBurndown } from "@/modules/projects/types/project-sprints";

interface SprintBurndownChartProps {
  burndown: SprintBurndown;
}

export default function SprintBurndownChart({ burndown }: SprintBurndownChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={burndown.chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="idealRemaining"
            stroke="var(--pm-progress-track)"
            dot={false}
          />
          <Line
            type="stepAfter"
            dataKey="actualRemaining"
            stroke="var(--pm-progress-fill-late)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
