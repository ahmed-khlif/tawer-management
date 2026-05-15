import type { EstimationProject, EstimatorConfig, ProjectTotals } from "../types/estimation"

const USD_RATE = 3.15
const EUR_RATE = 3.40

export function calcProjectTotals(
  project: EstimationProject,
  config: EstimatorConfig,
): ProjectTotals {
  const rawDays = project.lines
    .filter((l) => l.type === "item")
    .reduce((sum, l) => sum + (l.rawDays ?? 0), 0)

  const adjDays = config.aiBoost > 0 ? rawDays / config.aiBoost : rawDays
  const grossCost = adjDays * config.ratePerDay
  const discountAmt = grossCost * (config.discountPercent / 100)
  const finalCost = grossCost - discountAmt
  const tvaAmount = finalCost * ((config.tvaPercent ?? 19) / 100)
  const totalWithTva = finalCost + tvaAmount
  const timelineWeeks = Math.ceil(adjDays / (Math.max(1, config.teamSize) * 5))

  return { rawDays, adjDays, grossCost, discountAmt, finalCost, tvaAmount, totalWithTva, timelineWeeks }
}

export function formatCost(tnd: number, currency: string): string {
  const rounded = Math.round(tnd / 500) * 500
  if (currency === "USD") return "$" + Math.round(tnd / USD_RATE).toLocaleString()
  if (currency === "EUR") return "€" + Math.round(tnd / EUR_RATE).toLocaleString()
  return rounded.toLocaleString() + " TND"
}

export function formatCostExact(tnd: number, currency: string): string {
  if (currency === "USD") return "$" + Math.round(tnd / USD_RATE).toLocaleString()
  if (currency === "EUR") return "€" + Math.round(tnd / EUR_RATE).toLocaleString()
  return Math.round(tnd).toLocaleString() + " TND"
}

export function calcLineAdjDays(rawDays: number, aiBoost: number): number {
  return aiBoost > 0 ? rawDays / aiBoost : rawDays
}
