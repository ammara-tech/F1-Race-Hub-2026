// =====================================
// PODIUM PREDICTOR — pick P1/P2/P3 before the next race, get scored
// automatically once the live results arrive.
//   10 pts  driver in the exact position
//    3 pts  driver on the podium but in a different position
//   +10     bonus for a perfect podium
// =====================================

import { state, driversByPoints } from "../state.js";
import { escapeHtml, isRaceFinished, raceStart, formatDate, readStorage, writeStorage } from "../utils.js";

const STORAGE_KEY = "f1Predictions_2026";
const container = document.getElementById("predictor");

function getPredictions() {
  const saved = readStorage(STORAGE_KEY, {});
  return saved && typeof saved === "object" ? saved : {};
}

function raceKey(race) {
  return race.date; // dates are unique within a season
}

export function scorePrediction(picks, results) {
  if (!results?.length) return null;
  const podium = results.slice(0, 3).map(r => r.name);

  let points = 0;
  picks.forEach((name, i) => {
    if (podium[i] === name) points += 10;
    else if (podium.includes(name)) points += 3;
  });
  if (picks.every((name, i) => podium[i] === name)) points += 10;
  return points;
}

function pickSelect(id, label, selected) {
  const options = driversByPoints()
    .map(d => `<option value="${escapeHtml(d.name)}" ${d.name === selected ? "selected" : ""}>${escapeHtml(d.name)}</option>`)
    .join("");

  return `
    <label class="pick">
      <span>${label}</span>
      <select id="${id}" required>
        <option value="">Choose…</option>
        ${options}
      </select>
    </label>
  `;
}

function historyHTML(predictions) {
  const rows = state.races
    .filter(r => predictions[raceKey(r)] && isRaceFinished(r))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!rows.length) return `<p class="muted">Your scored predictions will show up here after each race.</p>`;

  let total = 0;
  const body = rows.map(race => {
    const picks = predictions[raceKey(race)].picks;
    const score = scorePrediction(picks, race.results);
    if (score !== null) total += score;
    const actual = race.results?.slice(0, 3).map(r => r.name) || [];

    return `
      <tr>
        <td>${escapeHtml(race.name)}</td>
        <td>${picks.map((p, i) => `<span class="${actual[i] === p ? "hit" : actual.includes(p) ? "near" : ""}">${escapeHtml(p)}</span>`).join("<br>")}</td>
        <td>${actual.length ? actual.map(escapeHtml).join("<br>") : "<span class=\"muted\">Awaiting results</span>"}</td>
        <td class="score">${score ?? "–"}</td>
      </tr>`;
  }).join("");

  return `
    <div class="predict-total">Your season score: <strong>${total}</strong> pts</div>
    <div class="table-scroll">
      <table class="predict-table">
        <thead><tr><th>Race</th><th>Your podium</th><th>Actual podium</th><th>Pts</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

export function renderPredictor() {
  if (!container) return;

  const predictions = getPredictions();
  const now = new Date();
  const nextRace = state.races.find(r => !isRaceFinished(r, now));
  const locked = nextRace && raceStart(nextRace) <= now;

  let formHTML;
  if (!nextRace) {
    formHTML = `<p>The season is over — thanks for playing! 🏁</p>`;
  } else {
    const saved = predictions[raceKey(nextRace)]?.picks || [];
    formHTML = `
      <h3>${escapeHtml(nextRace.name)}</h3>
      <p class="muted">${escapeHtml(nextRace.circuit)} · ${formatDate(nextRace.date)}${locked ? " · predictions are locked" : ""}</p>
      <form id="predictForm" class="predict-form" novalidate>
        ${pickSelect("pickP1", "🥇 P1", saved[0])}
        ${pickSelect("pickP2", "🥈 P2", saved[1])}
        ${pickSelect("pickP3", "🥉 P3", saved[2])}
        <button type="submit" ${locked ? "disabled" : ""}>${saved.length ? "Update prediction" : "Lock in prediction"}</button>
      </form>
      <p id="predictMessage" class="predict-message" role="status" aria-live="polite"></p>
    `;
  }

  container.innerHTML = `
    <div class="card predict-card">${formHTML}
      <p class="predict-rules">Scoring: 10 pts for the exact position · 3 pts if they're on the podium in another spot · +10 for a perfect podium.</p>
    </div>
    <div class="card predict-history">${historyHTML(predictions)}</div>
  `;
}

export function initPredictor() {
  if (!container) return;

  container.addEventListener("submit", event => {
    if (event.target.id !== "predictForm") return;
    event.preventDefault();

    const picks = ["pickP1", "pickP2", "pickP3"].map(id => document.getElementById(id).value);
    const message = document.getElementById("predictMessage");

    message.classList.remove("is-error");

    if (picks.some(p => !p)) {
      message.textContent = "Pick a driver for all three podium places.";
      message.classList.add("is-error");
      return;
    }
    if (new Set(picks).size !== 3) {
      message.textContent = "Each podium place needs a different driver.";
      message.classList.add("is-error");
      return;
    }

    const nextRace = state.races.find(r => !isRaceFinished(r));
    const predictions = getPredictions();
    predictions[raceKey(nextRace)] = { picks, savedAt: new Date().toISOString() };
    writeStorage(STORAGE_KEY, predictions);

    renderPredictor();
    const msg = document.getElementById("predictMessage");
    msg.textContent = "Prediction saved — check back after the race for your score!";
  });

  renderPredictor();
}
