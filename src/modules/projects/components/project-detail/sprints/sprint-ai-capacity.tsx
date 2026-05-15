"use client";

import { Sparkles } from "lucide-react";
import { ErrorBanner } from "@/components/error-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSprintAiCapacity } from "@/modules/projects/hooks/sprints/use-sprint-ai-capacity";

interface SprintAiCapacityProps {
  projectId?: string | null;
  sprintId?: string | null;
}

export function SprintAiCapacity({ projectId, sprintId }: SprintAiCapacityProps) {
  const query = useSprintAiCapacity(projectId, sprintId);

  if (!projectId || !sprintId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" /> AI capacity recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Save the sprint to get AI-driven capacity recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" /> AI capacity recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : query.error ? (
          <ErrorBanner error="Unable to load AI capacity signal." onRetry={() => void query.refetch()} />
        ) : !query.data ? (
          <p className="text-sm text-muted-foreground">
            No capacity signal available yet — try again after assigning a few tasks.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  query.data.riskLevel === "HIGH"
                    ? "destructive"
                    : query.data.riskLevel === "MEDIUM"
                      ? "secondary"
                      : "outline"
                }
              >
                Risk: {query.data.riskLevel}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {query.data.committedStoryPoints} / {query.data.sprintCapacity} pts committed
              </span>
            </div>
            <Progress value={Math.min(100, Math.round(query.data.utilizationPercent))} />
            {query.data.recommendations.length ? (
              <ul className="space-y-1 text-sm">
                {query.data.recommendations.map((item) => (
                  <li key={item} className="text-muted-foreground">
                    • {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {query.data.relatedAnomalies.length ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Anomalies</p>
                <ul className="space-y-1 text-sm">
                  {query.data.relatedAnomalies.map((anomaly) => (
                    <li key={anomaly.code} className="text-muted-foreground">
                      <span className="font-medium">[{anomaly.severity}]</span> {anomaly.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default SprintAiCapacity;
