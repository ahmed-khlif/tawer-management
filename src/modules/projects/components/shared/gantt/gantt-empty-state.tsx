"use client";

import { CalendarRange } from "lucide-react";
import { EmptyState } from "../empty-state";

interface GanttEmptyStateProps {
  message?: string;
  description?: string;
}

export default function GanttEmptyState({
  message = "No timeline data yet",
  description = "Add start and end dates to your sprints, epics, and tasks to see them on the Gantt chart.",
}: GanttEmptyStateProps) {
  return (
    <EmptyState
      icon={CalendarRange}
      message={message}
      description={description}
      compact
    />
  );
}
