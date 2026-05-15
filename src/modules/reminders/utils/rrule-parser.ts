/**
 * Basic RRULE string to human readable text converter.
 * Supports FREQ, INTERVAL, BYDAY.
 */
export function formatRRule(rrule?: string): string {
  if (!rrule) return "";

  const parts = rrule.split(";").reduce((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) {
      acc[key.toUpperCase()] = value.toUpperCase();
    }
    return acc;
  }, {} as Record<string, string>);

  const freq = parts["FREQ"];
  const interval = parseInt(parts["INTERVAL"] || "1", 10);
  const byDay = parts["BYDAY"];

  if (!freq) return rrule;

  let readable = "";

  switch (freq) {
    case "DAILY":
      readable = interval === 1 ? "Daily" : `Every ${interval} days`;
      break;
    case "WEEKLY":
      readable = interval === 1 ? "Weekly" : `Every ${interval} weeks`;
      if (byDay) {
        const days = byDay.split(",").map(day => {
          switch (day) {
            case "MO": return "Mon";
            case "TU": return "Tue";
            case "WE": return "Wed";
            case "TH": return "Thu";
            case "FR": return "Fri";
            case "SA": return "Sat";
            case "SU": return "Sun";
            default: return day;
          }
        }).join(", ");
        readable += ` on ${days}`;
      }
      break;
    case "MONTHLY":
      readable = interval === 1 ? "Monthly" : `Every ${interval} months`;
      break;
    case "YEARLY":
      readable = interval === 1 ? "Yearly" : `Every ${interval} years`;
      break;
    default:
      readable = rrule;
  }

  return readable;
}

/**
 * Common presets for RRULE
 */
export const RRULE_PRESETS = [
  { label: "Daily", value: "FREQ=DAILY;INTERVAL=1" },
  { label: "Every weekday (Mon-Fri)", value: "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR" },
  { label: "Weekly", value: "FREQ=WEEKLY;INTERVAL=1" },
  { label: "Bi-weekly", value: "FREQ=WEEKLY;INTERVAL=2" },
  { label: "Monthly", value: "FREQ=MONTHLY;INTERVAL=1" },
];
