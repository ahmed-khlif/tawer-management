import type { CalendarEventType, EventColor } from "@/modules/events/types";

export type ProjectCalendarSource =
  | "PROJECT"
  | "SPRINT"
  | "EPIC"
  | "MILESTONE"
  | "TASK"
  | "REMINDER"
  | "EVENT";

export interface ProjectCalendarItemResponse {
  id: string;
  sourceId: string;
  sourceType: ProjectCalendarSource;
  projectId: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  color: EventColor;
  status?: string | null;
  meta?: Record<string, unknown>;
}

export interface ProjectCalendarResponse {
  projectId: string;
  from: string;
  to: string;
  items: ProjectCalendarItemResponse[];
}

export interface ProjectCalendarItem extends CalendarEventType {
  sourceId: string;
  sourceType: ProjectCalendarSource;
  projectId: string;
  status?: string | null;
  meta?: Record<string, unknown>;
}

export interface ProjectCalendarData {
  projectId: string;
  from: Date;
  to: Date;
  items: ProjectCalendarItem[];
}
