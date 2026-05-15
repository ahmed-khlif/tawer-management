export type Priority = "Critical" | "High" | "Medium" | "Low"
export type Currency = "TND" | "USD" | "EUR"

export const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"]
export const CURRENCIES: Currency[] = ["TND", "USD", "EUR"]
export const AI_BOOST_OPTIONS = [1.0, 1.4, 1.8, 2.2, 2.5] as const

export interface EstimationLine {
  id: string
  type: "item" | "category"
  name: string
  priority?: Priority
  rawDays?: number
}

export interface EstimationProject {
  id: string
  name: string
  lines: EstimationLine[]
}

export interface EstimatorConfig {
  aiBoost: number
  teamSize: number
  currency: Currency
  discountPercent: number
  ratePerDay: number
  tvaPercent: number
}

export interface EstimatorState {
  projects: EstimationProject[]
  activeProjectId: string
  config: EstimatorConfig
}

export interface ProjectTotals {
  rawDays: number
  adjDays: number
  grossCost: number
  discountAmt: number
  finalCost: number
  tvaAmount: number
  totalWithTva: number
  timelineWeeks: number
}
