"use client";

/** Next Friday at 7 pm local time (or next week's if it's already past Friday 7 pm). */
export function nextQuestNight(from = new Date()): Date {
  const d = new Date(from);
  const daysUntilFriday = (5 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + daysUntilFriday);
  d.setHours(19, 0, 0, 0);
  if (d <= from) d.setDate(d.getDate() + 7);
  return d;
}

function icsLocal(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

/**
 * Downloads a weekly "Family Quest night" calendar event. Phones open it straight in
 * their calendar app, so the reminder lives where parents already plan their week.
 */
export function downloadQuestNightReminder(familyName: string) {
  const start = nextQuestNight();
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const url = window.location.origin;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Family Quest//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@familyquest`,
    `DTSTAMP:${icsLocal(new Date())}`,
    `DTSTART:${icsLocal(start)}`,
    `DTEND:${icsLocal(end)}`,
    "RRULE:FREQ=WEEKLY;BYDAY=FR",
    `SUMMARY:Family Quest night 🗝️`,
    `DESCRIPTION:A new chapter for ${familyName.replace(/[,;\\]/g, " ")} is ready. Open ${url}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Family Quest starts in 30 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = "family-quest-night.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
