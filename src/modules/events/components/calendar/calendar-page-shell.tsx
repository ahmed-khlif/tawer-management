"use client";

import AdminPageShell from "@/modules/projects/components/shared/admin-page-shell";
import { PageHeaderStrip } from "@/modules/projects/components/shared/page-header-strip";
import { CalendarDays, CalendarHeart, CalendarRange, Clock3, Handshake, ListTodo, Sparkles, SunMedium, Video } from "lucide-react";
import EventCalendarApp from "./event-calendar-app";
import { EventType } from "../../types";

type CalendarShellVariant = "event" | "meeting" | "personalEvent";

interface CalendarPageShellProps {
  type: EventType;
  variant: CalendarShellVariant;
}

const CALENDAR_SHELL_CONFIG = {
  event: {
    icon: CalendarDays,
    title: "Event Calendar",
    description:
      "Plan company events with the same command-center layout and clarity used throughout project management.",
    metrics: [
      { icon: Clock3, label: "Shared schedule", tone: "primary" as const },
      { icon: Sparkles, label: "Calendar workspace", tone: "info" as const },
    ],
  },
  meeting: {
    icon: Handshake,
    title: "Meetings Calendar",
    description:
      "Keep sync sessions, reviews, and decision meetings inside the same operating rhythm as the PM workspace.",
    metrics: [
      { icon: Video, label: "Meeting coordination", tone: "primary" as const },
      { icon: CalendarRange, label: "Shared timeline", tone: "info" as const },
    ],
  },
  personalEvent: {
    icon: CalendarHeart,
    title: "Personal Planning",
    description:
      "Manage your own rhythm, focus blocks, and personal schedule in the same clean workspace language.",
    metrics: [
      { icon: ListTodo, label: "Personal time blocks", tone: "primary" as const },
      { icon: SunMedium, label: "Daily planning", tone: "success" as const },
    ],
  },
};

export default function CalendarPageShell({ type, variant }: CalendarPageShellProps) {
  const config = CALENDAR_SHELL_CONFIG[variant];

  return (
    <AdminPageShell>
      <PageHeaderStrip
        icon={config.icon}
        title={config.title}
        description={config.description}
        metrics={config.metrics}
      />
      <div className="rounded-2xl border border-border/70 bg-card/95 p-3 shadow-sm">
        <EventCalendarApp type={type} />
      </div>
    </AdminPageShell>
  );
}
