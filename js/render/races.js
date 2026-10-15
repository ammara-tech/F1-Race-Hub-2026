// =====================================
// RACE CALENDAR (with filters, podiums and calendar buttons)
// =====================================

import { state } from "../state.js";
import { escapeHtml, isRaceFinished, formatDate, formatLocalStart } from "../utils.js";
import { googleCalendarUrl } from "../features/calendar-export.js";

const container = document.getElementById("racesContainer");
const filterBar = document.getElementById("raceFilters");

let activeFilter = "all";

const FILTERS = {
  all: () => true,
  upcoming: race => !isRaceFinished(race),
  completed: race => isRaceFinished(race),
  sprint: race => race.sprint
};

const MEDALS = ["🥇", "🥈", "🥉"];

function podiumHTML(race) {
  if (!race.results?.length) return "";
  return `
    <ol class="mini-podium">
      ${race.results.slice(0, 3).map((r, i) => `
        <li><span>${MEDALS[i]}</span> ${escapeHtml(r.name)}</li>
      `).join("")}
    </ol>
  `;
}

function calendarButtons(race) {
  return `
    <div class="card-actions">
      <button type="button" class="ghost small" data-ics="${race.date}" title="Download .ics for Apple / Outlook / Google">📅 Add to calendar</button>
      <a class="btn ghost small" href="${googleCalendarUrl(race)}" target="_blank" rel="noopener">Google</a>
    </div>
  `;
}

export function renderRaces() {
  if (!container) return;

  const now = new Date();
  const nextRace = state.races.find(race => !isRaceFinished(race, now));
  const list = state.races.filter(FILTERS[activeFilter]);

  if (!list.length) {
    container.innerHTML = `<p class="empty-note">No races match this filter.</p>`;
    return;
  }

  container.innerHTML = list.map(race => {
    const finished = isRaceFinished(race, now);
    const isNext = race === nextRace;
    const status = finished ? "Completed" : isNext ? "Next Up" : "Upcoming";
    const statusClass = finished ? "is-done" : isNext ? "is-next" : "is-upcoming";
    const localStart = formatLocalStart(race);

    return `
      <article class="card race-card ${statusClass}">
        <h3>${race.round ? `#${race.round} ` : ""}${escapeHtml(race.name)}</h3>
        <p>🌍 ${escapeHtml(race.country)}</p>
        <p>🏁 ${escapeHtml(race.circuit)}</p>
        <p>📅 ${formatDate(race.date)}${localStart && !finished ? ` · <strong>${localStart}</strong> your time` : ""}</p>
        ${race.duration ? `<p>⏱ ${escapeHtml(race.duration)}</p>` : ""}
        ${race.sprint ? `<p>⚡ Sprint Weekend</p>` : ""}
        <span class="race-status">${status}</span>
        ${finished ? podiumHTML(race) : calendarButtons(race)}
      </article>
    `;
  }).join("");
}

export function initRaceFilters() {
  filterBar?.addEventListener("click", event => {
    const chip = event.target.closest("[data-filter]");
    if (!chip) return;

    activeFilter = chip.dataset.filter;
    filterBar.querySelectorAll("[data-filter]").forEach(c => {
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderRaces();
  });
}
