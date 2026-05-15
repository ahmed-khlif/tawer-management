import { generateMeta } from "@/lib/utils";
import AnalyticsPageRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Executive Analytics",
    description: "Executive portfolio analytics across your accessible business units.",
    canonical: "/dashboard/analytics",
  });
}

export default function Page() {
  return <AnalyticsPageRender />;
}
