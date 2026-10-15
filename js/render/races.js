// =====================================
// RACE CALENDAR
// =====================================

import { escapeHtml, isRaceFinished } from "../utils.js";

const container = document.getElementById("racesContainer");

function formatDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function renderRaces(list) {
  if (!container) return;

  const now = new Date();
  const nextRace = list.find(race => !isRaceFinished(race, now));

  container.innerHTML = list.map(race => {
    const finished = isRaceFinished(race, now);
    const isNext = race === nextRace;
    const status = finished ? "Completed" : isNext ? "Next Up" : "Upcoming";
    const statusClass = finished ? "is-done" : isNext ? "is-next" : "is-upcoming";

    return `
      <div class="card race-card ${statusClass}">
        <h3>${race.round ? `#${race.round} ` : ""}${escapeHtml(race.name)}</h3>
        <p>🌍 ${escapeHtml(race.country)}</p>
        <p>🏁 ${escapeHtml(race.circuit)}</p>
        <p>📅 ${formatDate(race.date)}</p>
        <p>⏱ ${escapeHtml(race.duration)}</p>
        ${race.sprint ? `<p>⚡ Sprint Weekend</p>` : ""}
        <span class="race-status">${status}</span>
      </div>
    `;
  }).join("");
}
