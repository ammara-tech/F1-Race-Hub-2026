// =====================================
// PHOTO CREDITS (required by the Creative Commons licences)
// =====================================

import { escapeHtml } from "../utils.js";

const container = document.getElementById("creditsList");

const GROUP_TITLES = {
  drivers: "Drivers",
  logos: "Team logos",
  cars: "Cars",
  circuits: "Circuits",
  history: "History"
};

export function renderCredits(credits) {
  if (!container) return;

  const groups = Object.entries(credits).filter(([, items]) => Object.keys(items).length);

  if (!groups.length) {
    container.innerHTML = `<p class="muted">No photos downloaded yet — run <code>node scripts/download-images.mjs</code>.</p>`;
    return;
  }

  container.innerHTML = groups.map(([group, items]) => `
    <details class="credit-group">
      <summary>${GROUP_TITLES[group] || group} <span class="muted">(${Object.keys(items).length} photos)</span></summary>
      <ul>
        ${Object.values(items).map(info => `
          <li>
            <strong>${escapeHtml(info.label)}</strong> —
            ${info.page
              ? `<a href="${escapeHtml(info.page)}" target="_blank" rel="noopener">${escapeHtml(info.title)}</a>`
              : escapeHtml(info.title)}
            by ${escapeHtml(info.artist)}, ${escapeHtml(info.license)}
          </li>`).join("")}
      </ul>
    </details>
  `).join("");
}
