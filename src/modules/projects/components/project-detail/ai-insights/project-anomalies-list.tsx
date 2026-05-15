"use client";

import { AlertTriangle, CircleAlert, Info, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ProjectAnomaly } from "@/modules/projects/types/project-insights";

interface ProjectAnomaliesListProps {
  anomalies: ProjectAnomaly[];
}

const severityConfig = {
  LOW: {
    icon: Info,
    className: "pm-badge-risk-info border",
    surfaceClassName:
      "border-[color:var(--pm-tone-info-border)] bg-[color:var(--pm-tone-info-bg)]",
  },
  MEDIUM: {
    icon: AlertTriangle,
    className: "pm-badge-risk-medium border",
    surfaceClassName: "pm-surface-risk-medium",
  },
  HIGH: {
    icon: ShieldAlert,
    className: "pm-badge-risk-high border",
    surfaceClassName: "pm-surface-risk-high",
  },
} as const;

export function ProjectAnomaliesList({
  anomalies,
}: ProjectAnomaliesListProps) {
  const t = useTranslations("modules.projects.project.details");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CircleAlert className="size-5" />
          {t("aiInsights.anomalies", { defaultValue: "Detected anomalies" })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>
                {t("aiInsights.noAnomaliesTitle", {
                  defaultValue: "No anomalies detected",
                })}
              </EmptyTitle>
              <EmptyDescription>
                {t("aiInsights.noAnomaliesDescription", {
                  defaultValue: "The current analysis did not flag any project anomalies.",
                })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly) => {
              const config = severityConfig[anomaly.severity];
              const Icon = config.icon;

              return (
                <div
                  key={`${anomaly.code}-${anomaly.message}`}
                  className={`rounded-2xl border p-4 ${config.surfaceClassName}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-primary" />
                      <p className="font-medium">{anomaly.code}</p>
                    </div>
                    <Badge variant="outline" className={config.className}>{anomaly.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{anomaly.message}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProjectAnomaliesList;
