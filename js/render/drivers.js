// =====================================
// DRIVER CARDS
// =====================================

import { teamColor } from "../state.js";
import { escapeHtml } from "../utils.js";

const container = document.getElementById("driversContainer");

export function driverCardHTML(driver, { full = true } = {}) {
  const color = teamColor(driver.team);
  const titleYears = driver.championshipYears?.length
    ? driver.championshipYears.join(", ")
    : "None";

  return `
    <div class="card driver-card" style="border-left-color:${color}">
      <div class="car-number">${driver.number ?? ""}</div>
      <h3><span class="flag">${driver.flag ?? ""}</span>${escapeHtml(driver.name)}</h3>
      <span class="team-tag" style="background:${color}">${escapeHtml(driver.team)}</span>

      ${full ? `
        <p><strong>Nationality:</strong> ${escapeHtml(driver.nationality)}</p>
        <p>🏁 Career Wins: ${driver.wins}</p>
        <p>🏆 Championships: ${driver.worldChampionships}</p>
        <p>📅 Title Years: ${titleYears}</p>
        ${driver.points2026 !== undefined ? `<p>📊 2026 Points: ${driver.points2026}</p>` : ""}
      ` : ""}

      <p class="desc">${escapeHtml(driver.description)}</p>

      ${full ? `
        <button type="button" class="fav-add" data-driver="${escapeHtml(driver.name)}">
          ⭐ Add to Favourites
        </button>
      ` : ""}
    </div>
  `;
}

export function renderDrivers(driverList) {
  if (!container) return;

  if (!driverList.length) {
    container.innerHTML = "<p class=\"empty-note\">No drivers match your search.</p>";
    return;
  }

  // Build the whole list once instead of `innerHTML +=` in a loop,
  // which re-parses the container on every driver.
  container.innerHTML = driverList.map(d => driverCardHTML(d)).join("");
}
