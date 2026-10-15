// =====================================
// NEXT RACE COUNTDOWN
// =====================================

import { state } from "../state.js";
import { escapeHtml, isRaceFinished } from "../utils.js";

const container = document.getElementById("countdown");
let timer = null;

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
    return;
  }

  // data.json has no start times, so count down to the start of race day.
  const raceDay = new Date(`${nextRace.date}T00:00:00`);
  const diff = raceDay - now;

  let timerText;
  if (diff <= 0) {
    timerText = "🚦 It's race day!";
  } else {
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    timerText = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  container.innerHTML = `
    <h3>${escapeHtml(nextRace.name)}</h3>
    <p>${escapeHtml(nextRace.circuit)} · ${escapeHtml(nextRace.country)}</p>
    <p><strong>${nextRace.date}</strong></p>
    <div class="countdown-timer">${timerText}</div>
  `;
}

export function startCountdown() {
  if (!container || !state.races.length) return;

  updateCountdown();
  clearInterval(timer);
  timer = setInterval(updateCountdown, 1000);
}
