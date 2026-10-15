// =====================================
// DRIVER CARDS
// =====================================

import { teamColor } from "../state.js";
import { escapeHtml } from "../utils.js";
import { imageHTML } from "../images.js";

const container = document.getElementById("driversContainer");

function positionBadge(driver) {
  if (!driver.position) return "";
  return `<span class="pos-badge">P${driver.position}</span>`;
}

export function driverCardHTML(driver, { full = true } = {}) {
  const color = teamColor(driver.team);
  const titleYears = driver.championshipYears?.length
    ? driver.championshipYears.join(", ")
    : "None";

  return `
    <article class="card driver-card" style="border-left-color:${color}" data-driver="${escapeHtml(driver.name)}" tabindex="0" aria-label="${escapeHtml(driver.name)} — open profile">
      <div class="driver-photo">
        ${imageHTML("drivers", driver.name, { color, alt: `Photo of ${driver.name}` })}
        <div class="car-number">${driver.number ?? ""}</div>
        ${positionBadge(driver)}
      </div>

      <div class="driver-body">
        <h3><span class="flag">${driver.flag ?? ""}</span>${escapeHtml(driver.name)}</h3>
        <span class="team-tag" style="background:${color}">${escapeHtml(driver.team)}</span>

        ${full ? `
          <p><strong>Nationality:</strong> ${escapeHtml(driver.nationality)}</p>
          <p>📊 2026 Points: <strong>${driver.points2026 ?? 0}</strong>${driver.wins2026 ? ` · ${driver.wins2026} win${driver.wins2026 > 1 ? "s" : ""}` : ""}</p>
          <p>🏁 Career Wins: ${driver.wins}</p>
          <p>🏆 Championships: ${driver.worldChampionships}${driver.worldChampionships ? ` (${titleYears})` : ""}</p>
        ` : ""}

        <p class="desc">${escapeHtml(driver.description)}</p>

        ${full ? `
          <div class="card-actions">
            <button type="button" class="ghost small open-profile">View profile</button>
            <button type="button" class="small fav-add" data-driver="${escapeHtml(driver.name)}">⭐ Favourite</button>
          </div>
        ` : ""}
      </div>
    </article>
  `;
}

export function renderDrivers(driverList) {
  if (!container) return;

  if (!driverList.length) {
    container.innerHTML = "<p class=\"empty-note\">No drivers match your search.</p>";
    return;
  }

  container.innerHTML = driverList.map(d => driverCardHTML(d)).join("");
}
