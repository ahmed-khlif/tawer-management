import {
  ReminderChannel,
  ReminderDetail,
  ReminderList,
  ReminderSummary,
} from "@/modules/reminders/types";

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

function castChannels(value: unknown): ReminderChannel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((channel) => {
      if (!channel || typeof channel !== "object") {
        return null;
      }

      const item = channel as { id?: unknown; channel?: unknown };
      if (typeof item.id !== "string" || typeof item.channel !== "string") {
        return null;
      }

      return {
        id: item.id,
        channel: item.channel as ReminderChannel["channel"],
      };
    })
    .filter((channel): channel is ReminderChannel => channel !== null);
}

export function castReminderSummary(raw: ReminderSummary): ReminderSummary {
  return {
    ...raw,
    reminderAt: toDate(raw.reminderAt) ?? new Date(0),
    sentAt: toDate(raw.sentAt),
    createdAt: toDate(raw.createdAt) ?? new Date(0),
  };
}

export function castReminderDetail(raw: ReminderDetail): ReminderDetail {
  return {
    ...raw,
    reminderAt: toDate(raw.reminderAt) ?? new Date(0),
    sentAt: toDate(raw.sentAt),
    dismissedAt: toDate(raw.dismissedAt),
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
    channels: castChannels(raw.channels),
  };
}

export function castReminderList(raw: ReminderList): ReminderList {
  return {
    data: Array.isArray(raw.data) ? raw.data.map(castReminderSummary) : [],
    pagination: raw.pagination,
  };
}
