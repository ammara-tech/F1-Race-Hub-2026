// =====================================
// LAST RACE RESULT
// =====================================

import { teamColor, completedRacesWithResults } from "../state.js";
import { escapeHtml, formatDate } from "../utils.js";
import { imageHTML } from "../images.js";

const container = document.getElementById("lastResult");

function podiumStep(result, place) {
  const color = teamColor(result.team);
  return `
    <div class="podium-step podium-step--${place}" style="--team:${color}">
      <div class="podium-photo">${imageHTML("drivers", result.name, { color, alt: result.name })}</div>
      <div class="podium-pos">P${place}</div>
      <div class="podium-name">${escapeHtml(result.name)}</div>
      <div class="podium-team">${escapeHtml(result.team)}</div>
      ${result.time && place === 1 ? `<div class="podium-time">${escapeHtml(result.time)}</div>` : ""}
    </div>
  `;
}

export function renderLastResult() {
  if (!container) return;

  const race = completedRacesWithResults()[0];

  if (!race) {
    container.innerHTML = `
      <div class="card">
        <p>Race results appear here automatically when the live F1 data is available.</p>
      </div>`;
    return;
  }

  const [p1, p2, p3] = race.results;
  const rest = race.results.slice(3, 10);

  container.innerHTML = `
    <div class="card result-card">
      <h3>${escapeHtml(race.apiName || race.name)} <span class="muted">(Round ${race.round})</span></h3>
      <p>${escapeHtml(race.circuit)} · ${formatDate(race.date)}</p>

      <div class="podium">
        ${p2 ? podiumStep(p2, 2) : ""}
        ${p1 ? podiumStep(p1, 1) : ""}
        ${p3 ? podiumStep(p3, 3) : ""}
      </div>

      ${rest.length ? `
        <details class="result-more">
          <summary>Show P4 – P10</summary>
          <ol start="4" class="result-list">
            ${rest.map(r => `
              <li>
                <span class="result-name">${escapeHtml(r.name)}</span>
                <span class="result-team" style="color:${teamColor(r.team)}">${escapeHtml(r.team)}</span>
                <span class="result-pts">+${r.points}</span>
              </li>`).join("")}
          </ol>
        </details>` : ""}
    </div>
  `;
}
