// =====================================
// ADD RACES TO A CALENDAR
// .ics files work with Apple Calendar, Outlook and Google Calendar (import);
// the Google link opens a pre-filled event directly.
// =====================================

import { state } from "../state.js";
import { raceStart } from "../utils.js";

const RACE_HOURS = 2;

function icsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function dayStamp(isoDate, addDays = 0) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + addDays);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function icsEscape(text) {
  return String(text ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function eventLines(race) {
  const uid = `${race.date}-${(race.apiName || race.name).replace(/\W+/g, "-").toLowerCase()}@f1-race-hub`;
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `SUMMARY:${icsEscape(`🏁 ${race.apiName || race.name}`)}`,
    `LOCATION:${icsEscape(`${race.circuit}, ${race.country}`)}`,
    `DESCRIPTION:${icsEscape(`Round ${race.round ?? ""} of the 2026 F1 season${race.sprint ? " (Sprint weekend)" : ""}.`)}`
  ];

  if (race.time) {
    const start = raceStart(race);
    const end = new Date(start.getTime() + RACE_HOURS * 3600 * 1000);
    lines.push(`DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${dayStamp(race.date)}`, `DTEND;VALUE=DATE:${dayStamp(race.date, 1)}`);
  }

  lines.push("END:VEVENT");
  return lines;
}

function downloadIcs(races, fileName) {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//F1 Race Hub//2026//EN",
    "CALSCALE:GREGORIAN",
    ...races.flatMap(eventLines),
    "END:VCALENDAR"
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: fileName });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function googleCalendarUrl(race) {
  let dates;
  if (race.time) {
    const start = raceStart(race);
    const end = new Date(start.getTime() + RACE_HOURS * 3600 * 1000);
    dates = `${icsDate(start)}/${icsDate(end)}`;
  } else {
    dates = `${dayStamp(race.date)}/${dayStamp(race.date, 1)}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `🏁 ${race.apiName || race.name}`,
    dates,
    location: `${race.circuit}, ${race.country}`,
    details: `Round ${race.round ?? ""} of the 2026 Formula 1 season.`
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function slug(text) {
  return text.toLowerCase().replace(/\W+/g, "-").replace(/(^-|-$)/g, "");
}

export function initCalendarExport() {
  document.addEventListener("click", event => {
    const one = event.target.closest("[data-ics]");
    if (one) {
      const race = state.races.find(r => r.date === one.dataset.ics);
      if (race) downloadIcs([race], `${slug(race.apiName || race.name)}.ics`);
      return;
    }

    if (event.target.closest("#downloadSeasonIcs")) {
      const upcoming = state.races.filter(r => raceStart(r) > new Date());
      downloadIcs(upcoming.length ? upcoming : state.races, "f1-2026-calendar.ics");
    }
  });
}
