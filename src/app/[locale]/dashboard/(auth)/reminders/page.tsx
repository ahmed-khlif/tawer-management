import { generateMeta } from "@/lib/utils";
import RemindersPageRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Reminders",
    description: "Track project and personal reminders.",
    canonical: "/dashboard/reminders",
  });
}

export default function Page() {
  return <RemindersPageRender />;
}
