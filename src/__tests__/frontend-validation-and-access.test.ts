import { describe, expect, it } from "vitest";
import { getSignInFormSchema } from "@/modules/auth/validation/schemas/auth/sign-in";
import { getEventFormSchema } from "@/modules/events/validations/event.schema";
import {
  buildOpenStreetMapUrl,
  formatCoordinatesLocation
} from "@/modules/events/utils/location";
import {
  canExportEmployeeAnalytics,
  canSeeAnalyticsNav,
  canSeeProjectExecutivePanels,
  canViewExecutiveOverview,
  resolveEmployeeAnalyticsAccess
} from "@/modules/analytics/utils/access";
import {
  hasAdminBypassRole,
  hasExecutiveRole,
  normalizeRoleNames
} from "@/modules/auth/utils/role-access";
import { normalizeOptionalPhone } from "@/modules/users/utils/normalize-optional-phone";
import { truncateToMaxDecimals } from "@/utils/truncate-decimals";

const t = (key: string) => key;

describe("frontend authentication validation", () => {
  const schema = getSignInFormSchema();

  it("accepts a valid sign-in payload", () => {
    expect(schema.safeParse({ email: "ceo@example.com", password: "TestPass123!" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(schema.safeParse({ email: "not-an-email", password: "TestPass123!" }).success).toBe(false);
  });

  it("rejects a short password", () => {
    expect(schema.safeParse({ email: "ceo@example.com", password: "short" }).success).toBe(false);
  });

  it("uses translated validation messages when provided", () => {
    const translated = getSignInFormSchema((key) => `translated:${key}`);
    const result = translated.safeParse({ email: "bad", password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("translated:");
    }
  });
});

describe("frontend event validation", () => {
  const schema = getEventFormSchema({ t });
  const validEvent = {
    title: "Sprint planning",
    description: "Plan next iteration",
    location: "Tawer Digital Group",
    latitude: 36.8065,
    longitude: 10.1815,
    participantsId: ["user-1"],
    projectId: "project-1",
    allUsers: false,
    startTime: "2026-07-01T09:00:00.000Z",
    endTime: "2026-07-01T10:00:00.000Z",
    color: "sky"
  };

  it("accepts a valid event with map coordinates", () => {
    expect(schema.safeParse(validEvent).success).toBe(true);
  });

  it("keeps location optional", () => {
    const { location, latitude, longitude, ...withoutLocation } = validEvent;
    expect(schema.safeParse(withoutLocation).success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(schema.safeParse({ ...validEvent, title: "" }).success).toBe(false);
  });

  it("rejects an empty start time", () => {
    expect(schema.safeParse({ ...validEvent, startTime: "" }).success).toBe(false);
  });

  it("rejects an end time before the start time", () => {
    expect(
      schema.safeParse({
        ...validEvent,
        startTime: "2026-07-01T10:00:00.000Z",
        endTime: "2026-07-01T09:00:00.000Z"
      }).success
    ).toBe(false);
  });

  it("applies the default event color", () => {
    const { color, ...withoutColor } = validEvent;
    const result = schema.parse(withoutColor);
    expect(result.color).toBe("sky");
  });
});

describe("frontend location helpers", () => {
  it("formats coordinates with six decimal places", () => {
    expect(formatCoordinatesLocation(36.8064948, 10.1815316)).toBe("36.806495, 10.181532");
  });

  it("builds an OpenStreetMap URL with marker coordinates", () => {
    expect(buildOpenStreetMapUrl(36.8065, 10.1815)).toContain("mlat=36.8065&mlon=10.1815");
  });

  it("uses zoom level 17 for event-location context", () => {
    expect(buildOpenStreetMapUrl(36.8065, 10.1815)).toContain("#map=17/36.8065/10.1815");
  });
});

describe("frontend formatting and optional phone helpers", () => {
  it("truncates decimal values beyond the maximum", () => {
    expect(truncateToMaxDecimals("12.34567", 2)).toBe("12.34");
  });

  it("keeps decimal values within the maximum", () => {
    expect(truncateToMaxDecimals("12.34", 2)).toBe("12.34");
  });

  it("keeps integer values unchanged", () => {
    expect(truncateToMaxDecimals("12", 2)).toBe("12");
  });

  it("supports zero-decimal truncation", () => {
    expect(truncateToMaxDecimals("12.99", 0)).toBe("12.");
  });

  it("normalizes empty phone values to undefined", () => {
    expect(normalizeOptionalPhone("")).toBeUndefined();
  });

  it("normalizes pending placeholder phones to undefined", () => {
    expect(normalizeOptionalPhone("pending-phone-user-1")).toBeUndefined();
  });

  it("keeps real phone values", () => {
    expect(normalizeOptionalPhone("+21650123456")).toBe("+21650123456");
  });
});

describe("frontend role and analytics access helpers", () => {
  it("normalizes uppercase executive roles", () => {
    expect(normalizeRoleNames(["CEO", "CTO"])).toEqual(["ceo", "cto"]);
  });

  it("ignores invalid role values", () => {
    expect(normalizeRoleNames(["CEO", null, "", 42])).toEqual(["ceo"]);
  });

  it("detects executive roles", () => {
    expect(hasExecutiveRole(["CMO"])).toBe(true);
  });

  it("detects admin bypass roles", () => {
    expect(hasAdminBypassRole(["admin"])).toBe(true);
  });

  it("allows executive overview navigation for executives", () => {
    expect(canViewExecutiveOverview(["CEO"])).toBe(true);
  });

  it("hides analytics navigation for non-executive roles", () => {
    expect(canSeeAnalyticsNav(["softwareEngineer"])).toBe(false);
  });

  it("allows executive project panels for CTO role", () => {
    expect(canSeeProjectExecutivePanels(["CTO"])).toBe(true);
  });

  it("resolves self employee analytics access", () => {
    const access = resolveEmployeeAnalyticsAccess({
      currentUser: { id: "user-1", roles: ["softwareEngineer"] },
      targetUserId: "user-1"
    });
    expect(access.state).toBe("self");
    expect(canExportEmployeeAnalytics(access)).toBe(true);
  });

  it("resolves executive employee analytics access", () => {
    const access = resolveEmployeeAnalyticsAccess({
      currentUser: { id: "ceo-1", roles: ["CEO"] },
      targetUserId: "user-1"
    });
    expect(access.state).toBe("executive");
    expect(access.backHref).toBe("/dashboard/analytics");
  });

  it("defers unknown access decisions to the backend", () => {
    const access = resolveEmployeeAnalyticsAccess({
      currentUser: { id: "user-2", roles: ["softwareEngineer"] },
      targetUserId: "user-1"
    });
    expect(access.state).toBe("defer_to_backend");
    expect(access.canLoad).toBe(true);
  });
});
