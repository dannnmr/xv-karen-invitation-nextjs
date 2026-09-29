/**
 * Portado desde la referencia (P1/P2/P4). A diferencia de esas versiones:
 *  - la fecha ya viene con offset de zona horaria explícito desde la config
 *    (`invitation.ts` -> `-04:00`), así que `toISOString()` produce el
 *    instante correcto en cualquier entorno (antes, en Vercel/UTC, salía
 *    corrido 4 h);
 *  - en vez de un `data:` URI (que iOS Safari NO descarga ni previsualiza)
 *    devolvemos el texto `.ics` crudo para que quien llame arme un Blob.
 */
export function getCalendarLinks(
  date: Date,
  eventName: string = "XV Años",
  details: string = "",
  location: string = "",
) {
  // AAAAMMDDTHHMMSSZ (UTC) -- formato que piden Google Calendar e iCalendar.
  const toStamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const startStamp = toStamp(date);
  const endStamp = toStamp(new Date(date.getTime() + 6 * 60 * 60 * 1000));

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    eventName,
  )}&dates=${startStamp}/${endStamp}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

  // Escape mínimo de iCalendar (RFC 5545): coma, punto y coma, saltos.
  const esc = (s: string) =>
    s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\r?\n/g, "\\n");
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//xv-karen-invitation//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${startStamp}-xv-karen@invitation`,
    `DTSTAMP:${toStamp(new Date())}`,
    `DTSTART:${startStamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${esc(eventName)}`,
    `DESCRIPTION:${esc(details)}`,
    `LOCATION:${esc(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return { googleUrl, icsContent };
}
