import type { EstimationProject, EstimatorConfig } from "../types/estimation"

function id() {
  return crypto.randomUUID()
}

export const DEFAULT_CONFIG: EstimatorConfig = {
  aiBoost: 1.0,
  teamSize: 3,
  currency: "TND",
  discountPercent: 0,
  ratePerDay: 0,
  tvaPercent: 19,
}

export const DEFAULT_PROJECTS: EstimationProject[] = []
