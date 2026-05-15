/**
 * Convert a backend `UserType` enum value (e.g. `TawerDevProjectManager`) into
 * a human-readable label (e.g. "Tawer Dev Project Manager").
 *
 * - Whole-word ALL-CAPS acronyms are preserved (`CEO`, `CTO`, `CMO`, `HR`).
 * - camelCase / PascalCase are split on word boundaries.
 * - Internal acronym groups stay together (e.g. `UiUxDesigner` → "Ui Ux Designer").
 */
export function formatUserRoleLabel(role: string): string {
  if (!role) return "";
  if (/^[A-Z]{2,5}$/.test(role)) return role;
  return role
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
}
