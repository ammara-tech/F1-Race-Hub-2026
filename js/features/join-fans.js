// =====================================
// JOIN THE GRID — fan sign-up widget
// Own storage key and own DOM lookups, so it stays independent
// from the rest of the site.
// =====================================

import { escapeHtml, readStorage, writeStorage } from "../utils.js";

const STORAGE_KEY = "f1FansJoined";

const form = document.getElementById("fanJoinForm");
const nameInput = document.getElementById("fanName");
const emailInput = document.getElementById("fanEmail");
const teamInput = document.getElementById("fanTeam");
const messageEl = document.getElementById("fanJoinMessage");
const listEl = document.getElementById("fanList");
const countEl = document.getElementById("fanCount");

function getFans() {
  const fans = readStorage(STORAGE_KEY, []);
  return Array.isArray(fans) ? fans : [];
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showMessage(text, isError) {
  messageEl.textContent = text;
  messageEl.classList.toggle("fan-join-message--error", !!isError);
}

function renderFans() {
  const fans = getFans();
  countEl.textContent = fans.length;

  if (!fans.length) {
    listEl.innerHTML = `<p class="fan-empty">No fans have joined on this device yet — be the first!</p>`;
    return;
  }

  listEl.innerHTML = fans
    .slice()
    .reverse()
    .map(fan => `
      <div class="fan-chip">
        <span class="fan-chip-name">${escapeHtml(fan.name)}</span>
        <span class="fan-chip-team">${escapeHtml(fan.team)}</span>
        <button type="button" class="fan-chip-remove" data-email="${escapeHtml(fan.email)}" aria-label="Remove ${escapeHtml(fan.name)}">✕</button>
      </div>
    `)
    .join("");
}

// Fill the team dropdown from data.json so it always matches the Teams section.
function fillTeamOptions(teams) {
  if (!teams?.length) return;

  teamInput.innerHTML =
    `<option value="" disabled selected>Choose a team…</option>` +
    teams.map(t => `<option>${escapeHtml(t.name)}</option>`).join("");
}

function handleSubmit(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const team = teamInput.value;

  if (!name || !email || !team) {
    showMessage("Please fill in your name, email and favourite team.", true);
    return;
  }

  if (!isValidEmail(email)) {
    showMessage("That doesn't look like a valid email address.", true);
    return;
  }

  const fans = getFans();

  if (fans.some(f => f.email.toLowerCase() === email.toLowerCase())) {
    showMessage("You're already on the grid with that email!", true);
    return;
  }

  fans.push({ name, email, team, joinedAt: new Date().toISOString() });
  writeStorage(STORAGE_KEY, fans);
  renderFans();

  form.reset();
  showMessage(`Welcome to the grid, ${name}!`, false);
}

function handleListClick(event) {
  const btn = event.target.closest(".fan-chip-remove");
  if (!btn) return;

  writeStorage(STORAGE_KEY, getFans().filter(f => f.email !== btn.dataset.email));
  renderFans();
}

export function initJoinFans(teams) {
  if (!form) return; // widget not on this page

  fillTeamOptions(teams);
  form.addEventListener("submit", handleSubmit);
  listEl.addEventListener("click", handleListClick);
  renderFans();
}
