"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { calcProjectTotals, formatCost } from "../utils/calculations"
import type { EstimationProject, EstimatorConfig } from "../types/estimation"

interface Props {
  project: EstimationProject
  config: EstimatorConfig
}

export default function SummaryCards({ project, config }: Props) {
  const t = useTranslations("modules.estimator.summary")
  const { rawDays, adjDays, grossCost, discountAmt, finalCost, tvaAmount, totalWithTva, timelineWeeks } =
    calcProjectTotals(project, config)

  const hasDiscount = config.discountPercent > 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Raw man-days */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("rawDays")}</p>
          <p className="mt-1 text-2xl font-semibold">{Math.round(rawDays)}</p>
          <p className="text-xs text-muted-foreground">{t("rawDaysSub")}</p>
        </CardContent>
      </Card>

      {/* AI-adjusted days */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("adjDays")}</p>
          <p className="mt-1 text-2xl font-semibold">{Math.round(adjDays)}</p>
          <p className="text-xs text-muted-foreground">×{config.aiBoost.toFixed(1)} AI boost</p>
        </CardContent>
      </Card>

      {/* Full cost breakdown: HT → discount → TVA → TTC */}
      <Card className="col-span-2">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("costBreakdown")}</p>

          <div className="space-y-1 text-sm">
            {/* Gross HT */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("grossHt")}</span>
              <span className={hasDiscount ? "line-through text-muted-foreground" : "font-medium"}>
                {formatCost(grossCost, config.currency)}
              </span>
            </div>

            {/* Discount line */}
            {hasDiscount && (
              <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                <span>{t("discount")} (-{config.discountPercent}%)</span>
                <span>−{formatCost(discountAmt, config.currency)}</span>
              </div>
            )}

            {/* Total HT (after discount) — only show separately when discount applied */}
            {hasDiscount && (
              <div className="flex items-center justify-between font-medium">
                <span>{t("totalHt")}</span>
                <span>{formatCost(finalCost, config.currency)}</span>
              </div>
            )}

            <Separator className="my-1" />

            {/* TVA */}
            <div className="flex items-center justify-between text-muted-foreground">
              <span>TVA {config.tvaPercent}%</span>
              <span>+{formatCost(tvaAmount, config.currency)}</span>
            </div>

            <Separator className="my-1" />

            {/* Total TTC */}
            <div className="flex items-center justify-between text-base font-bold">
              <span>{t("totalTtc")}</span>
              <span className="text-primary">{formatCost(totalWithTva, config.currency)}</span>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-muted-foreground">
            {t("rateNote", { rate: config.ratePerDay })}
          </p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("timeline")}</p>
          <p className="mt-1 text-2xl font-semibold">{timelineWeeks}w</p>
          <p className="text-xs text-muted-foreground">
            {config.teamSize} dev{config.teamSize !== 1 ? "s" : ""} full-time
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
