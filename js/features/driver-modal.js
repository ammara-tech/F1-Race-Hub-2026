// =====================================
// DRIVER PROFILE POPUP (native <dialog>) with a 2026 points chart
// =====================================

import { state, teamColor, findDriver } from "../state.js";
import { escapeHtml } from "../utils.js";
import { imageHTML, imageFor, creditLine } from "../images.js";

const dialog = document.getElementById("driverModal");
const body = document.getElementById("driverModalBody");

// Cumulative points line chart, drawn as plain SVG (no chart library needed).
function pointsChart(driver) {
  const history = driver.pointsHistory || [];
  if (history.length < 2) {
    return `<p class="muted chart-empty">The points chart appears once live race results are available.</p>`;
  }

  const teammate = state.drivers.find(d => d.team === driver.team && d !== driver);
  const mateHistory = teammate?.pointsHistory || [];

  const W = 560, H = 220, PAD_L = 40, PAD_R = 16, PAD_T = 16, PAD_B = 30;
  // round the axis up to a tidy number (e.g. 261 -> 300, step 75)
  const highest = Math.max(10, ...history.map(h => h.total), ...mateHistory.map(h => h.total));
  const rawStep = highest / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= rawStep);
  const maxPts = step * 4;
  const x = i => PAD_L + (i / (history.length - 1)) * (W - PAD_L - PAD_R);
  const y = v => PAD_T + (1 - v / maxPts) * (H - PAD_T - PAD_B);

  const line = list => list.map((h, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(h.total).toFixed(1)}`).join(" ");
  const color = teamColor(driver.team);

  const gridLines = [0, 1, 2, 3, 4].map(n => {
    const v = n * step;
    return `<line x1="${PAD_L}" x2="${W - PAD_R}" y1="${y(v)}" y2="${y(v)}" class="chart-grid"/>
            <text x="${PAD_L - 6}" y="${y(v) + 4}" text-anchor="end" class="chart-label">${v}</text>`;
  }).join("");

  const dots = history.map((h, i) => `
    <circle cx="${x(i)}" cy="${y(h.total)}" r="3.5" fill="${color}">
      <title>Round ${h.round} · ${escapeHtml(h.race)}: finished ${escapeHtml(h.finish)}, ${h.total} pts total</title>
    </circle>`).join("");

  const roundLabels = history.map((h, i) =>
    (i % 2 === 0 || i === history.length - 1)
      ? `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" class="chart-label">R${h.round}</text>` : ""
  ).join("");

  return `
    <figure class="points-chart">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(driver.name)} 2026 points after each round">
        ${gridLines}
        ${mateHistory.length === history.length ? `<path d="${line(mateHistory)}" class="chart-mate"/>` : ""}
        <path d="${line(history)}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>
        ${dots}
        ${roundLabels}
      </svg>
      <figcaption>
        <span class="key" style="--c:${color}"></span> ${escapeHtml(driver.name)}
        ${teammate && mateHistory.length === history.length ? `<span class="key key--mate"></span> ${escapeHtml(teammate.name)} (teammate)` : ""}
      </figcaption>
    </figure>
  `;
}

function recentResults(driver) {
  const last = (driver.pointsHistory || []).slice(-5).reverse();
  if (!last.length) return "";
  return `
    <h4>Last ${last.length} races</h4>
    <ul class="recent-results">
      ${last.map(h => `<li><span>R${h.round} ${escapeHtml(h.race.replace(" Grand Prix", " GP"))}</span><strong>${escapeHtml(h.finish === "–" ? "–" : `P${h.finish}`)}</strong></li>`).join("")}
    </ul>
  `;
}

export function openDriverModal(name) {
  const driver = findDriver(name);
  if (!driver || !dialog) return;

  const color = teamColor(driver.team);
  const photo = imageFor("drivers", driver.name);

  body.innerHTML = `
    <div class="modal-hero" style="--team:${color}">
      <div class="modal-photo">${imageHTML("drivers", driver.name, { color, alt: `Photo of ${driver.name}` })}</div>
      <div>
        <div class="eyebrow">${driver.flag ?? ""} ${escapeHtml(driver.nationality)} · #${driver.number ?? "–"}</div>
        <h2 id="driverModalTitle" class="section-heading">${escapeHtml(driver.name)}</h2>
        <span class="team-tag" style="background:${color}">${escapeHtml(driver.team)}</span>
        <p class="modal-desc">${escapeHtml(driver.description)}</p>
      </div>
    </div>

    <div class="modal-stats">
      <div><strong>${driver.position ? `P${driver.position}` : "–"}</strong><span>2026 position</span></div>
      <div><strong>${driver.points2026 ?? 0}</strong><span>2026 points</span></div>
      <div><strong>${driver.wins2026 ?? 0}</strong><span>2026 wins</span></div>
      <div><strong>${driver.bestFinish2026 ? `P${driver.bestFinish2026}` : "–"}</strong><span>Best finish</span></div>
      <div><strong>${driver.wins}</strong><span>Career wins</span></div>
      <div><strong>${driver.worldChampionships}</strong><span>World titles</span></div>
    </div>

    <h4>2026 points, round by round</h4>
    ${pointsChart(driver)}
    ${recentResults(driver)}

    ${photo ? `<p class="photo-credit">${creditLine(photo)}</p>` : ""}
  `;

  dialog.showModal();
}

export function initDriverModal() {
  if (!dialog) return;

  // Open from any driver card (but not when the Favourite button is pressed)
  document.addEventListener("click", event => {
    if (event.target.closest(".fav-add")) return;
    const card = event.target.closest(".driver-card[data-driver]");
    if (card) openDriverModal(card.dataset.driver);
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    const card = event.target.closest?.(".driver-card[data-driver]");
    if (card && event.target === card) openDriverModal(card.dataset.driver);
  });

  dialog.addEventListener("click", event => {
    // click on the backdrop (outside the panel) or the close button
    if (event.target === dialog || event.target.closest("[data-close]")) dialog.close();
  });
}
