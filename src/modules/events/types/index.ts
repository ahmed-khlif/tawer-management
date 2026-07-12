import { z } from "zod";

export type CalendarView = "month" | "week" | "day" | "agenda";
export type EventType = "meeting" | "event" | "personalEvent";
export type EventTypeOnBackendSide = "Meeting" | "Event" | "PersonalEvent";
export const EventColorEnum = z.enum(["sky", "amber", "violet", "rose", "emerald", "orange"]);
export type EventColor = z.infer<typeof EventColorEnum>;
export type EventColorOnBackendSide = "Sky" | "Amber" | "Violet" | "Rose" | "Emerald" | "Orange";

export interface CalendarEventRequestType {
  content: {
    title: string;
    description?: string;
  }[];
  toAllUsers?: boolean;
  participantsIds?: string[];
  projectId?: string | null;
  startTime: string;
  endTime: string;
  color?: EventColorOnBackendSide;
  location?: string;
  latitude?: number;
  longitude?: number;
  type: EventTypeOnBackendSide;
}

export interface CalendarEventType {
  id: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  color?: EventColor;

  startDate: Date;
  endDate: Date;

  participantsIds?: string[];
  projectId?: string;

  toAllUsers?: boolean;

  createdById?: string;
}

export interface CalendarEventInResponseType {
  id: string;

  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  color: EventColorOnBackendSide;

  startTime: string;
  endTime?: string;

  participantsIds?: string[];
  projectId?: string;
  toAllUsers?: boolean;
  createdById: string;
}

export interface EventLocationSuggestionType {
  label: string;
  latitude: number;
  longitude: number;
}
