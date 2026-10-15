// =====================================
// FAVOURITE DRIVERS (saved in localStorage)
// =====================================

import { state, teamColor } from "../state.js";
import { escapeHtml, readStorage, writeStorage } from "../utils.js";
import { imageHTML } from "../images.js";

const STORAGE_KEY = "favouriteDrivers";
const container = document.getElementById("favouriteDriver");
const driversContainer = document.getElementById("driversContainer");

function getFavourites() {
  const list = readStorage(STORAGE_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveFavourite(driverName) {
  const driver = state.drivers.find(d => d.name === driverName);
  if (!driver) return;

  const favourites = getFavourites();

  if (!favourites.some(f => f.name === driverName)) {
    favourites.push({ name: driver.name, team: driver.team });
    writeStorage(STORAGE_KEY, favourites);
  }

  renderFavourites();
}

export function removeFavourite(driverName) {
  writeStorage(STORAGE_KEY, getFavourites().filter(f => f.name !== driverName));
  renderFavourites();
}

export function renderFavourites() {
  if (!container) return;

  const favourites = getFavourites();

  if (!favourites.length) {
    container.innerHTML = "No favourite drivers selected yet.";
    return;
  }

  const cards = favourites.map(fav => {
    // Read live stats from data.json so saved favourites never show old numbers.
    const driver = state.drivers.find(d => d.name === fav.name) || fav;
    const wins = driver.wins ?? "–";
    const titles = driver.worldChampionships ?? driver.championships ?? "–";

    return `
      <div class="fav-card" style="border-left:3px solid ${teamColor(driver.team)}">
        <div class="fav-thumb">${imageHTML("drivers", driver.name, { color: teamColor(driver.team) })}</div>
        <div class="fav-info">
          <h4>${escapeHtml(driver.name)}</h4>
          <p>🏎 ${escapeHtml(driver.team)} · 📊 ${driver.points2026 ?? 0} pts (2026) · 🏁 ${wins} career wins · 🏆 ${titles} titles</p>
        </div>
        <button type="button" class="fav-remove" data-driver="${escapeHtml(driver.name)}">Remove</button>
      </div>
    `;
  }).join("");

  container.innerHTML = `<h3>⭐ My Favourite Drivers</h3>${cards}`;
}

// Event delegation: one listener each, instead of inline onclick="" per card.
export function initFavourites() {
  driversContainer?.addEventListener("click", event => {
    const btn = event.target.closest(".fav-add");
    if (btn) saveFavourite(btn.dataset.driver);
  });

  container?.addEventListener("click", event => {
    const btn = event.target.closest(".fav-remove");
    if (btn) removeFavourite(btn.dataset.driver);
  });

  renderFavourites();
}
