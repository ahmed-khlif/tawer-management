"use client";

import { CalendarRange } from "lucide-react";
import { EmptyState } from "../empty-state";

export default function GanttEmptyState() {
  return (
    <EmptyState
      icon={CalendarRange}
      message="No timeline data yet"
      description="Add start and end dates to your sprints, epics, and tasks to see them on the Gantt chart."
      compact
    />
  );
}
