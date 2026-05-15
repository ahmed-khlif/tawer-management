import { generateMeta } from "@/lib/utils";
import EmployeeAnalyticsPageRender from "./render";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata() {
  return generateMeta({
    title: "Employee Analytics",
    description: "Task and productivity analytics for a single employee.",
    canonical: "/dashboard/analytics/employees",
  });
}

export default async function Page({ params }: Props) {
  const { userId } = await params;
  return <EmployeeAnalyticsPageRender userId={userId} />;
}
