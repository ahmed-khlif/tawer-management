import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";
import CalendarPageShell from "@/modules/events/components/calendar/calendar-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Event Calendar",
    description:
      "Plan your events or tasks in an organized way with the Calendar app template. Built with shadcn/ui, Next.js, Tailwind CSS ve React.",
    canonical: "/apps/calendar"
  });
}

export default function Page() {
  return <CalendarPageShell type="event" variant="event" />;
}
