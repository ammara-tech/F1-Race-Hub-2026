// =====================================
// SMALL HELPERS USED ACROSS THE APP
// =====================================

// Escape text before putting it into innerHTML.
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// "Nico Hülkenberg" -> "nico hulkenberg" (for matching API names to ours)
export function normalizeName(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// "Autódromo Hermanos Rodríguez" -> "autodromo-hermanos-rodriguez"
// Used for image file names, so it must match data/image-sources.json.
export function slugify(value) {
  return normalizeName(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function initials(name) {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Race start as a Date. Uses the real start time (UTC) when the API gave one,
// otherwise midnight local time on race day.
export function raceStart(race) {
  return race.time
    ? new Date(`${race.date}T${race.time}`)
    : new Date(`${race.date}T00:00:00`);
}

// A race counts as finished ~3h after lights out, or at the end of race day
// when we don't know the start time.
export function isRaceFinished(race, now = new Date()) {
  if (race.results?.length) return true;
  const end = race.time
    ? new Date(raceStart(race).getTime() + 3 * 3600 * 1000)
    : new Date(`${race.date}T23:59:59`);
  return end < now;
}

export function formatDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// Start time in the visitor's own time zone, e.g. "Sun 25 Oct, 21:00"
export function formatLocalStart(race) {
  if (!race.time) return null;
  return raceStart(race).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Unofficial all-time score, only used by the Face-Off.
export function legacyScore(driver) {
  return (driver.points2026 ?? 0) + driver.wins * 3 + driver.worldChampionships * 20;
}

// localStorage that never throws (private mode, corrupt JSON, etc.)
export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`Could not read "${key}" from storage:`, err);
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Could not save "${key}" to storage:`, err);
  }
}

export function timeAgo(date) {
  const secs = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}
