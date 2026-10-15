// =====================================
// TEAM CARDS
// =====================================

import { DEFAULT_COLOR } from "../state.js";
import { escapeHtml } from "../utils.js";

const container = document.getElementById("teamsContainer");

export function renderTeams(list) {
  if (!container) return;

  container.innerHTML = list.map(team => {
    const color = team.color || DEFAULT_COLOR;

    return `
      <div class="card team-card" style="border-left-color:${color}">
        <div class="team-swatch" style="background:${color}"></div>
        <h3>${escapeHtml(team.name)}</h3>
        <p><strong>Drivers:</strong> ${team.drivers.map(escapeHtml).join(", ")}</p>
        ${team.engine ? `<p><strong>Power Unit:</strong> ${escapeHtml(team.engine)}</p>` : ""}
        <p>${escapeHtml(team.description)}</p>
      </div>
    `;
  }).join("");
}
