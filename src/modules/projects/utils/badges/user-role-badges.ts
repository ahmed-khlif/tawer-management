import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Per-role hue palette (oklch H channel, 0–360).
 *
 * Each backend `UserType` enum gets its own hue so the member badge color is
 * unique per role while remaining cognitively grouped by family (executives,
 * engineering, creative, …). Pair with the `.pm-badge-user-role` /
 * `.pm-dot-user-role` utilities defined in `status-tokens.css`, which read
 * the `--pm-role-h` CSS variable to produce light/dark colors.
 */
export const ROLE_HUES: Record<string, number> = {
  // Executive — gold/amber spectrum
  CEO: 70,
  CTO: 50,
  CMO: 30,

  // Product — purples
  ProductOwner: 300,
  ScrumMaster: 285,
  BusinessAnalyst: 275,

  // Project management leads
  TawerDevProjectManager: 245,
  TawerCreativeProjectManager: 325,

  // Engineering — blue spectrum
  SoftwareEngineer: 230,
  DataEngineer: 205,
  DevopsEngineer: 195,
  QualityAssuranceEngineer: 265,
  MobileAppDeveloper: 250,
  FrontendDeveloper: 260,
  BackendDeveloper: 220,
  FullStackDeveloper: 240,
  SystemsArchitect: 215,

  // Platform — teal/cyan with a security accent
  DatabaseAdministrator: 180,
  NetworkEngineer: 170,
  CyberSecuritySpecialist: 20,

  // Creative — magenta/pink/warm
  GraphicDesigner: 335,
  SocialMediaManager: 350,
  ContentWriter: 25,
  VideoEditor: 10,
  UiUxDesigner: 310,
  SeoSpecialist: 130,

  // People & support
  HRManager: 80,
  CustomerSupport: 145,

  // Onboarding states
  PendingApproval: 285,
  TawerCreativeIntern: 295,
  TawerDevIntern: 255,
};

/**
 * Deterministic fallback hue for any role we haven't mapped explicitly.
 * Uses a tiny string hash so the same role always gets the same color.
 */
function hashHue(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return hash;
}

/** Returns the OKLCH hue (0–360) for a role enum value. */
export function getRoleHue(role: string): number {
  if (!role) return 280;
  if (ROLE_HUES[role] !== undefined) return ROLE_HUES[role];
  return hashHue(role);
}

/** Badge chrome — pair with `Badge variant="outline"`. */
export function userRoleBadgeClass(extra?: string): string {
  return cn("pm-badge-user-role border font-medium", extra);
}

/** Leading status dot for role pills. */
export function userRoleDotClass(extra?: string): string {
  return cn("pm-dot-user-role size-1.5 shrink-0 rounded-full", extra);
}

/**
 * Inline style that exposes the role's hue via the `--pm-role-h` custom property.
 * Cascades to the dot inside the same badge, so set this on the wrapping element.
 */
export function userRoleStyle(role: string): CSSProperties {
  return { ["--pm-role-h" as string]: getRoleHue(role) } as CSSProperties;
}
