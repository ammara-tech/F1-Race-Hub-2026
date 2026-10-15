// =====================================
// TEAM CARDS
// =====================================

import { state, DEFAULT_COLOR } from "../state.js";
import { escapeHtml } from "../utils.js";
import { imageHTML } from "../images.js";

const container = document.getElementById("teamsContainer");

export function renderTeams(list) {
  if (!container) return;

  container.innerHTML = list.map(team => {
    const color = team.color || DEFAULT_COLOR;
    const standing = state.constructorStandings.find(s => s.team === team.name);

    return `
      <article class="card team-card" style="border-left-color:${color}">
        <div class="team-logo logo-box">
          ${imageHTML("logos", team.name, { color, alt: `${team.name} logo`, placeholder: "logo", className: "logo-img" })}
          ${standing ? `<span class="pos-badge">P${standing.position}</span>` : ""}
        </div>
        <div class="team-swatch" style="background:${color}"></div>
        <h3>${escapeHtml(team.name)}</h3>
        ${team.car ? `<p class="team-car">${escapeHtml(team.car)}</p>` : ""}
        <p><strong>Drivers:</strong> ${team.drivers.map(escapeHtml).join(", ")}</p>
        ${team.engine ? `<p><strong>Power Unit:</strong> ${escapeHtml(team.engine)}</p>` : ""}
        ${standing ? `<p><strong>2026:</strong> ${standing.points} pts${standing.wins ? ` · ${standing.wins} wins` : ""}</p>` : ""}
        <p>${escapeHtml(team.description)}</p>
      </article>
    `;
  }).join("");
}
