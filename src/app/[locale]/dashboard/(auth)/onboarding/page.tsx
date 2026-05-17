import { generateMeta } from "@/lib/utils";
import OnboardingRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Workspace Onboarding",
    description: "Discover how project templates, planning, tasks, and reminders fit together in your workspace.",
    canonical: "/dashboard/onboarding",
  });
}

export default function Page() {
  return <OnboardingRender />;
}
