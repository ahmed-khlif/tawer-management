import {
  ProjectCalendarData,
  ProjectCalendarItem,
  ProjectCalendarResponse,
} from "./project-calendar";

const toDate = (value: unknown, fallback: Date) => {
  if (typeof value === "string" || value instanceof Date) {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
};

const normalizeItems = (items: unknown[]): ProjectCalendarItem[] =>
  items
    .map((raw): ProjectCalendarItem | null => {
      if (!raw || typeof raw !== "object") {
        return null;
      }

      const source = raw as Record<string, unknown>;
      const fallbackStart = new Date();
      const startDate = toDate(source.startDate, fallbackStart);
      const fallbackEnd = new Date(startDate);
      fallbackEnd.setHours(fallbackEnd.getHours() + 1);
      const endDate = toDate(source.endDate, fallbackEnd);

      return {
        id: typeof source.id === "string" ? source.id : crypto.randomUUID(),
        sourceId:
          typeof source.sourceId === "string" ? source.sourceId : "",
        sourceType:
          typeof source.sourceType === "string"
            ? (source.sourceType as ProjectCalendarItem["sourceType"])
            : "TASK",
        projectId:
          typeof source.projectId === "string" ? source.projectId : "",
        title:
          typeof source.title === "string" && source.title.trim().length > 0
            ? source.title
            : "Untitled item",
        description:
          typeof source.description === "string" ? source.description : undefined,
        startDate,
        endDate,
        color:
          typeof source.color === "string"
            ? (source.color as ProjectCalendarItem["color"])
            : "sky",
        status:
          typeof source.status === "string" ? source.status : undefined,
        meta:
          source.meta && typeof source.meta === "object"
            ? (source.meta as Record<string, unknown>)
            : undefined,
      };
    })
    .filter((item): item is ProjectCalendarItem => item !== null);

export function castProjectCalendar(
  response: ProjectCalendarResponse | null | undefined,
): ProjectCalendarData {
  const now = new Date();

  return {
    projectId: response?.projectId ?? "",
    from: toDate(response?.from, now),
    to: toDate(response?.to, now),
    items: normalizeItems(Array.isArray(response?.items) ? response!.items : []),
  };
}

