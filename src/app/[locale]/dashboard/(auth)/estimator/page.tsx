import { generateMeta } from "@/lib/utils"
import EstimatorPageRender from "./render"

export async function generateMetadata() {
  return generateMeta({
    title: "Project Estimator",
    description: "Project cost estimator with AI boost, TVA, CSV import/export, and discount support.",
    canonical: "/dashboard/estimator",
  })
}

export default function Page() {
  return <EstimatorPageRender />
}
