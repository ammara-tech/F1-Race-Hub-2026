// =====================================
// DRIVER FACE-OFF
// =====================================

import { state } from "../state.js";
import { escapeHtml, driverScore } from "../utils.js";

const form = document.getElementById("compareForm");
const inputA = document.getElementById("driverA");
const inputB = document.getElementById("driverB");
const result = document.getElementById("compareResult");
const suggestions = document.getElementById("driverNames");

function findDriver(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // exact full-name match first, then partial match
  return (
    state.drivers.find(d => d.name.toLowerCase() === q) ||
    state.drivers.find(d => d.name.toLowerCase().includes(q)) ||
    null
  );
}

function statLine(d) {
  return `${escapeHtml(d.name)}: ${d.wins} wins · ${d.worldChampionships} titles · ${d.points2026 ?? 0} pts (2026)`;
}

export function compareDrivers() {
  if (!result) return;

  const a = findDriver(inputA.value);
  const b = findDriver(inputB.value);

  if (!a || !b) {
    result.innerHTML = `<div class="card">❌ Please enter two valid driver names.</div>`;
    return;
  }

  if (a === b) {
    result.innerHTML = `<div class="card">❌ Pick two different drivers to compare.</div>`;
    return;
  }

  const scoreA = driverScore(a);
  const scoreB = driverScore(b);

  let verdict;
  if (scoreA === scoreB) verdict = "🤝 Dead heat — they're level";
  else verdict = `🏆 ${escapeHtml(scoreA > scoreB ? a.name : b.name)} leads the duel`;

  result.innerHTML = `
    <div class="card">
      <h3>🏁 ${escapeHtml(a.name)} vs ${escapeHtml(b.name)}</h3>
      <p>${statLine(a)}</p>
      <p>${statLine(b)}</p>
      <div class="winner">${verdict}</div>
    </div>
  `;
}

export function initCompare() {
  if (!form) return;

  // Autocomplete list of every driver's name
  if (suggestions) {
    suggestions.innerHTML = state.drivers
      .map(d => `<option value="${escapeHtml(d.name)}"></option>`)
      .join("");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    compareDrivers();
  });
}
