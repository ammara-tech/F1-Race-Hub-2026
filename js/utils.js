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

// Weighted, unofficial score used by both the standings and the face-off.
export function driverScore(driver) {
  return (driver.points2026 ?? 0) + driver.wins * 3 + driver.worldChampionships * 20;
}

// Races have no start time in data.json, so a race counts as finished
// once its race day is over (end of day, local time).
export function raceDayEnd(race) {
  return new Date(`${race.date}T23:59:59`);
}

export function isRaceFinished(race, now = new Date()) {
  return raceDayEnd(race) < now;
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
