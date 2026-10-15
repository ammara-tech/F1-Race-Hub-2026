// =====================================
// STANDINGS (weighted score, clearly labelled as unofficial)
// =====================================

import { state, teamColor } from "../state.js";
import { escapeHtml, driverScore } from "../utils.js";

const container = document.getElementById("standingsContainer");

export function renderStandings() {
  if (!container) return;

  if (!state.drivers.length) {
    container.innerHTML = "<p>No driver data loaded.</p>";
    return;
  }

  const scored = state.drivers
    .map(d => ({ ...d, score: driverScore(d) }))
    .sort((a, b) => b.score - a.score);

  const maxScore = scored[0].score || 1;

  const rows = scored.map((d, i) => {
    const color = teamColor(d.team);
    const widthPct = Math.max(6, Math.round((d.score / maxScore) * 100));
    const pts = d.points2026 !== undefined ? ` · ${d.points2026} pts (2026)` : "";

    return `
      <div class="standing-row ${i === 0 ? "p1" : ""}">
        <div class="standing-rank">${i + 1}</div>
        <div class="standing-name">
          ${d.flag ?? ""} ${escapeHtml(d.name)}
          <small>${escapeHtml(d.team)}${pts}</small>
        </div>
        <div class="standing-pts" style="color:${color}">${d.score}</div>
        <div class="standing-bar-track">
          <div class="standing-bar-fill" style="width:${widthPct}%; background:${color}"></div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `<div class="standings-list">${rows}</div>`;
}
