"use client";

import Link from "next/link";
import { Activity, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProjectCapacity } from "@/modules/projects/types/project-insights";
import { cn } from "@/lib/utils";

interface ProjectCapacityViewProps {
  capacity: ProjectCapacity;
}

export function ProjectCapacityView({ capacity }: ProjectCapacityViewProps) {
  const t = useTranslations("modules.projects.project.details");
  const utilizationPercent =
    capacity.totalCapacityPoints > 0
      ? Math.min(
          100,
          Math.round(
            (capacity.totalCommittedPoints / capacity.totalCapacityPoints) * 100,
          ),
        )
      : 0;

  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-5" />
            {t("analytics.capacity", { defaultValue: "Team performance" })}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {capacity.totalCommittedPoints}/{capacity.totalCapacityPoints} points committed across active sprint capacity.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Open a member card to drill into Employee Analytics when backend access allows it.
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            capacity.riskLevel === "HIGH" && "pm-badge-risk-high border",
            capacity.riskLevel === "MEDIUM" && "pm-badge-risk-medium border",
            capacity.riskLevel === "LOW" && "pm-badge-risk-low border",
          )}
        >
          {capacity.riskLevel} risk
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Portfolio load</p>
              <p className="text-xs text-muted-foreground">
                Current sprint commitment against available team capacity.
              </p>
            </div>
            <Badge variant="outline" className="font-medium">
              {utilizationPercent}%
            </Badge>
          </div>
          <Progress
            value={utilizationPercent}
            indicatorColor={
              capacity.riskLevel === "HIGH"
                ? "bg-[color:var(--pm-project-stopped-accent)]"
                : capacity.riskLevel === "MEDIUM"
                  ? "bg-[color:var(--pm-tone-warning-fg)]"
                  : "bg-[color:var(--pm-project-running-accent)]"
            }
          />
          <div className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
            <div className="rounded-xl bg-background/70 px-3 py-2">
              <p className="font-medium text-foreground">{capacity.activeSprints}</p>
              <p>Active sprints</p>
            </div>
            <div className="rounded-xl bg-background/70 px-3 py-2">
              <p className="font-medium text-foreground">{capacity.totalRemainingPoints}</p>
              <p>Remaining points</p>
            </div>
            <div className="rounded-xl bg-background/70 px-3 py-2">
              <p className="font-medium text-foreground">{capacity.unassignedCommittedPoints}</p>
              <p>Unassigned points</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {capacity.members.map((member) => (
          <div key={member.userId} className="rounded-2xl border border-border/60 bg-background/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.committedPoints}/{member.capacityPoints} pts committed
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  member.isOverCapacity
                    ? "pm-badge-risk-high border"
                    : "pm-badge-risk-low border"
                }
              >
                {Math.round(member.utilizationPercent)}%
              </Badge>
            </div>

            <div className="mt-3 space-y-2">
              <Progress
                value={Math.max(0, Math.min(100, member.utilizationPercent))}
                indicatorColor={
                  member.isOverCapacity
                    ? "bg-[color:var(--pm-project-stopped-accent)]"
                    : "bg-[color:var(--pm-project-running-accent)]"
                }
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{member.remainingPoints} pts remaining</span>
                <span>{(member.trackedWorkMinutes / 60).toFixed(1)}h tracked</span>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="mt-4 w-full justify-start gap-2">
              <Link href={`/dashboard/analytics/employees/${member.userId}`}>
                <Activity className="size-4" />
                View Employee Analytics
              </Link>
            </Button>
          </div>
        ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectCapacityView;
