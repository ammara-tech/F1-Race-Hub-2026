// =====================================
// NEXT RACE COUNTDOWN — counts to lights out when the start time is known
// =====================================

import { state } from "../state.js";
import { escapeHtml, isRaceFinished, raceStart, formatDate, formatLocalStart } from "../utils.js";

const container = document.getElementById("countdown");
let timer = null;
let shownRace = null; // only rebuild the card when the next race changes

function pad(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  const nextRace = state.races.find(race => !isRaceFinished(race, now));

  if (!nextRace) {
    container.innerHTML = `
      <h3>🏁 2026 Season Complete!</h3>
      <p>See you next season.</p>
    `;
    clearInterval(timer);
    shownRace = null;
    return;
  }

  const diff = raceStart(nextRace) - now;
  const localStart = formatLocalStart(nextRace);

  let timerText;
  if (diff <= 0) {
    timerText = nextRace.time ? "🚦 Race in progress!" : "🚦 It's race day!";
  } else {
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    timerText = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  if (shownRace === nextRace) {
    container.querySelector(".countdown-timer").textContent = timerText;
    return;
  }

  shownRace = nextRace;
  container.innerHTML = `
    <h3>${escapeHtml(nextRace.name)}</h3>
    <p>${escapeHtml(nextRace.circuit)} · ${escapeHtml(nextRace.country)}</p>
    <p><strong>${localStart ? `Lights out ${localStart} (your time)` : formatDate(nextRace.date)}</strong></p>
    <div class="countdown-timer">${timerText}</div>
    <div class="card-actions center">
      <button type="button" class="ghost small" data-ics="${nextRace.date}">📅 Add to calendar</button>
      <button type="button" class="ghost small" id="downloadSeasonIcs">Download full season</button>
    </div>
  `;
}

export function startCountdown() {
  if (!container || !state.races.length) return;

  shownRace = null;
  updateCountdown();
  clearInterval(timer);
  timer = setInterval(updateCountdown, 1000);
}
