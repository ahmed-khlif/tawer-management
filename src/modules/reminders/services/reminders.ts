import { DELETE, GET, PATCH, POST } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  CreateReminderDto,
  ReminderDetail,
  ReminderList,
  ReminderQueryParams,
  UpdateReminderDto,
} from "@/modules/reminders/types";
import {
  castReminderDetail,
  castReminderList,
} from "@/modules/reminders/types/cast-reminder";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

function buildQuery(params?: ReminderQueryParams) {
  const query = new URLSearchParams();
  if (!params) return query.toString();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

const EMPTY_REMINDERS: ReminderList = {
  data: [],
  pagination: { records: 0, currentPage: 1, totalPages: 0, perPage: 20 },
};

export async function fetchProjectReminders(
  projectId: string,
  params?: ReminderQueryParams,
): Promise<ReminderList> {
  if (isMockMode()) return EMPTY_REMINDERS;

  const query = buildQuery(params);

  try {
    const response = await GET(
      query
        ? `${API.REMINDERS.PROJECT_LIST(projectId)}?${query}`
        : API.REMINDERS.PROJECT_LIST(projectId),
      getHeaders(),
    );
    return castReminderList(response.data as ReminderList);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchProjectReminders(projectId, params))) ??
        EMPTY_REMINDERS
      );
    }
    throw error;
  }
}

export async function fetchMyReminders(
  params?: ReminderQueryParams,
): Promise<ReminderList> {
  if (isMockMode()) return EMPTY_REMINDERS;

  const query = buildQuery(params);

  try {
    const response = await GET(
      query ? `${API.REMINDERS.MY_REMINDERS()}?${query}` : API.REMINDERS.MY_REMINDERS(),
      getHeaders(),
    );
    return castReminderList(response.data as ReminderList);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchMyReminders(params))) ?? EMPTY_REMINDERS;
    }
    throw error;
  }
}

export async function fetchReminderDetail(
  projectId: string,
  reminderId: string,
): Promise<ReminderDetail | null> {
  if (isMockMode()) return null;

  try {
    const response = await GET(
      API.REMINDERS.PROJECT_DETAIL(projectId, reminderId),
      getHeaders(),
    );
    return castReminderDetail(response.data as ReminderDetail);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchReminderDetail(projectId, reminderId))) ??
        null
      );
    }
    throw error;
  }
}

export async function createReminder(
  projectId: string,
  data: CreateReminderDto,
): Promise<ReminderDetail> {
  if (isMockMode()) {
    return {
      id: crypto.randomUUID(),
      userId: data.userId,
      entityType: data.entityType,
      entityId: data.entityId ?? null,
      projectId,
      taskId: data.entityType === "TASK" ? data.entityId ?? null : null,
      milestoneId: data.entityType === "MILESTONE" ? data.entityId ?? null : null,
      message: data.message ?? null,
      reminderAt: data.reminderAt,
      isRecurring: data.isRecurring ?? false,
      recurrenceRule: data.recurrenceRule ?? null,
      createdById: data.userId,
      status: "PENDING",
      sentAt: null,
      dismissedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: data.userId, name: "Mock User", email: "mock@example.com" },
      createdBy: { id: data.userId, name: "Mock User" },
      channels: (data.channels ?? []).map((channel) => ({
        id: crypto.randomUUID(),
        channel,
      })),
    };
  }

  try {
    const response = await POST(
      API.REMINDERS.PROJECT_CREATE(projectId),
      getHeaders(),
      data,
    );
    return castReminderDetail(response.data as ReminderDetail);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => createReminder(projectId, data))) as ReminderDetail;
    }
    throw error;
  }
}

export async function updateReminder(
  projectId: string,
  reminderId: string,
  data: UpdateReminderDto,
): Promise<ReminderDetail> {
  if (isMockMode()) {
    return {
      id: reminderId,
      userId: "mock-user",
      entityType: "CUSTOM",
      entityId: null,
      projectId,
      taskId: null,
      milestoneId: null,
      message: data.message ?? null,
      reminderAt: data.reminderAt ?? new Date(),
      isRecurring: data.isRecurring ?? false,
      recurrenceRule: data.recurrenceRule ?? null,
      createdById: "mock-user",
      status: "PENDING",
      sentAt: null,
      dismissedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: "mock-user", name: "Mock User", email: "mock@example.com" },
      createdBy: { id: "mock-user", name: "Mock User" },
      channels: [],
    };
  }

  try {
    const response = await PATCH(
      API.REMINDERS.PROJECT_UPDATE(projectId, reminderId),
      getHeaders(),
      data,
    );
    return castReminderDetail(response.data as ReminderDetail);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        updateReminder(projectId, reminderId, data),
      )) as ReminderDetail;
    }
    throw error;
  }
}

export async function deleteReminder(projectId: string, reminderId: string): Promise<void> {
  if (isMockMode()) return;

  try {
    await DELETE(API.REMINDERS.PROJECT_DELETE(projectId, reminderId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => deleteReminder(projectId, reminderId));
      return;
    }
    throw error;
  }
}

export async function cancelReminder(projectId: string, reminderId: string): Promise<void> {
  if (isMockMode()) return;

  try {
    await POST(API.REMINDERS.PROJECT_CANCEL(projectId, reminderId), getHeaders(), {});
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => cancelReminder(projectId, reminderId));
      return;
    }
    throw error;
  }
}

export async function dismissReminder(reminderId: string): Promise<void> {
  if (isMockMode()) return;

  try {
    await POST(API.REMINDERS.DISMISS(reminderId), getHeaders(), {});
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => dismissReminder(reminderId));
      return;
    }
    throw error;
  }
}
