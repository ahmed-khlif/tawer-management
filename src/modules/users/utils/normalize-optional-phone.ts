export function normalizeOptionalPhone(phone?: string | null) {
  if (!phone) return undefined;
  if (phone.startsWith("pending-phone-")) return undefined;
  return phone;
}
