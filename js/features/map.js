// =====================================
// CIRCUIT MAP (Leaflet)
// =====================================

import { state } from "../state.js";
import { escapeHtml } from "../utils.js";

let map = null;

export function showMap() {
  if (!window.L) {
    console.warn("Leaflet not loaded — circuit map skipped.");
    return;
  }

  if (!state.circuits.length || map) return;

  map = L.map("map", {
    worldCopyJump: true,
    scrollWheelZoom: false // don't hijack page scrolling; click the map to enable
  }).setView([20, 10], 2);

  map.on("click", () => map.scrollWheelZoom.enable());
  map.on("mouseout", () => map.scrollWheelZoom.disable());

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  state.circuits.forEach(c => {
    const race = state.races.find(r => r.circuit === c.name);
    const raceLine = race ? `<br>${escapeHtml(race.name)} · ${race.date}` : "";

    const marker = L.marker([c.lat, c.lng]).addTo(map);
    marker.bindPopup(`<b>${escapeHtml(c.name)}</b><br>${escapeHtml(c.country)}${raceLine}`);
    marker.on("mouseover", () => marker.openPopup());
  });
}
