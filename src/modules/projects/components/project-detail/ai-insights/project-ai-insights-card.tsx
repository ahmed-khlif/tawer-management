"use client";

import { AlertTriangle, BrainCircuit, CheckCircle2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectAiInsights } from "@/modules/projects/types/project-insights";

interface ProjectAiInsightsCardProps {
  insights: ProjectAiInsights;
}

function getRiskLabel(insights: ProjectAiInsights) {
  if (insights.anomalies.some((anomaly) => anomaly.severity === "HIGH")) {
    return { label: "High risk", className: "pm-badge-risk-high border" };
  }

  if (insights.anomalies.some((anomaly) => anomaly.severity === "MEDIUM")) {
    return { label: "Medium risk", className: "pm-badge-risk-medium border" };
  }

  return { label: "Low risk", className: "pm-badge-risk-low border" };
}

export function ProjectAiInsightsCard({
  insights,
}: ProjectAiInsightsCardProps) {
  const t = useTranslations("modules.projects.project.details");
  const risk = getRiskLabel(insights);
  const insightSummary = [
    {
      key: "anomalies",
      icon: AlertTriangle,
      value: insights.anomalies.length,
      label: t("aiInsights.summaryAnomalies", {
        defaultValue: "Anomalies detected",
      }),
    },
    {
      key: "recommendations",
      icon: Sparkles,
      value: insights.recommendations.length,
      label: t("aiInsights.summaryRecommendations", {
        defaultValue: "Recommendations returned",
      }),
    },
    {
      key: "blocked",
      icon: CheckCircle2,
      value: insights.metrics.blockedTasks,
      label: t("aiInsights.summaryBlocked", {
        defaultValue: "Blocked tasks in scope",
      }),
    },
  ];

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--pm-project-running-accent) 9%, transparent) 0%, transparent 45%, color-mix(in srgb, var(--pm-tone-info-fg) 8%, transparent) 100%)",
        }}
      />
      <CardHeader className="relative flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BrainCircuit className="size-5" />
            {t("tabs.aiInsights", { defaultValue: "AI Insights" })}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("aiInsights.summary", {
              defaultValue:
                "Project-level AI metrics, anomaly detection, and planning recommendations.",
            })}
          </p>
        </div>
        <Badge variant="outline" className={risk.className}>{risk.label}</Badge>
      </CardHeader>
      <CardContent className="relative grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {insightSummary.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className="rounded-2xl border border-border/60 bg-background/85 p-4"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg pm-tone-info">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-xs uppercase tracking-[0.14em]">
                    {item.label}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/85 p-4">
          <h3 className="mb-3 text-sm font-medium">
            {t("aiInsights.recommendations", {
              defaultValue: "Recommendations",
            })}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {insights.recommendations.length > 0 ? (
              insights.recommendations.map((recommendation, index) => (
                <li
                  key={`${recommendation}-${index}`}
                  className="rounded-xl border border-border/60 bg-muted/30 px-3 py-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full pm-tone-running">
                      <Sparkles className="size-3.5" />
                    </span>
                    <span>{recommendation}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-border/60 bg-muted/30 px-3 py-3">
                {t("aiInsights.noRecommendations", {
                  defaultValue: "No recommendations were returned for this project.",
                })}
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectAiInsightsCard;
