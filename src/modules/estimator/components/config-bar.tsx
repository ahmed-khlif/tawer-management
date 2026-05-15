"use client"

import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EstimatorConfig } from "../types/estimation"
import { AI_BOOST_OPTIONS, CURRENCIES } from "../types/estimation"

interface Props {
  config: EstimatorConfig
  onChange: (partial: Partial<EstimatorConfig>) => void
}

export default function ConfigBar({ config, onChange }: Props) {
  const t = useTranslations("modules.estimator.config")

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4 print:hidden">
      {/* AI Boost */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <Label className="text-xs text-muted-foreground">{t("aiBoost")}</Label>
        <Select
          value={String(config.aiBoost)}
          onValueChange={(v) => onChange({ aiBoost: parseFloat(v) })}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_BOOST_OPTIONS.map((b) => (
              <SelectItem key={b} value={String(b)}>
                {t(`boostOptions.${b.toFixed(1).replace(".", "_")}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Size */}
      <div className="flex flex-col gap-1.5 min-w-[100px]">
        <Label className="text-xs text-muted-foreground">{t("teamSize")}</Label>
        <Input
          type="number"
          min={1}
          className="h-8 text-sm"
          value={config.teamSize}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            if (!isNaN(v) && v >= 1) onChange({ teamSize: v })
          }}
        />
      </div>

      {/* Currency */}
      <div className="flex flex-col gap-1.5 min-w-[110px]">
        <Label className="text-xs text-muted-foreground">{t("currency")}</Label>
        <Select
          value={config.currency}
          onValueChange={(v) => onChange({ currency: v as typeof config.currency })}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Discount */}
      <div className="flex flex-col gap-1.5 min-w-[110px]">
        <Label className="text-xs text-muted-foreground">{t("discount")}</Label>
        <Input
          type="number"
          min={0}
          max={100}
          className="h-8 text-sm"
          value={config.discountPercent}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v) && v >= 0 && v <= 100) onChange({ discountPercent: v })
          }}
        />
      </div>

      {/* TVA */}
      <div className="flex flex-col gap-1.5 min-w-[100px]">
        <Label className="text-xs text-muted-foreground">{t("tva")}</Label>
        <Input
          type="number"
          min={0}
          max={100}
          className="h-8 text-sm"
          value={config.tvaPercent}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v) && v >= 0 && v <= 100) onChange({ tvaPercent: v })
          }}
        />
      </div>

      {/* Rate per day */}
      <div className="flex flex-col gap-1.5 min-w-[130px]">
        <Label className="text-xs text-muted-foreground">{t("ratePerDay")}</Label>
        <Input
          type="number"
          min={1}
          className="h-8 text-sm"
          value={config.ratePerDay}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v) && v > 0) onChange({ ratePerDay: v })
          }}
        />
      </div>
    </div>
  )
}
