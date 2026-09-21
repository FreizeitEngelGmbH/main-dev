/**
 * Formatting helpers for group-activity ("Mach-mit-Gruppen") data, shared
 * between the partner-side list card and detail page so both read the raw
 * API fields (ISO date, minutes, numeric-or-string price) the same way.
 */

export function formatActivityDateTime(iso: string): string {
  const d = new Date(iso);
  // Explicit Europe/Berlin timeZone: all activity times are German local
  // times regardless of where the viewer's browser happens to be set to.
  const date = d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  });
  const time = d.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
  return `${date} • ${time} Uhr`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} Std. ${m} Min.`;
  if (h > 0) return `${h} Std.`;
  return `${m} Min.`;
}

export function formatPricePerPerson(price: string | number): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  const formatted = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
  return `${formatted} € / Person`;
}
