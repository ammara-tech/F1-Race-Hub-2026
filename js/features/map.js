// =====================================
// CIRCUIT MAP (Leaflet) — popups show a local photo of each venue
// =====================================

import { state } from "../state.js";
import { escapeHtml, formatDate, isRaceFinished } from "../utils.js";
import { imageFor } from "../images.js";

let map = null;
let markers = [];

function popupHTML(circuit) {
  const race = state.races.find(r => r.circuit === circuit.name);
  const photo = imageFor("circuits", circuit.name);
  const winner = race?.results?.[0]?.name;

  return `
    <div class="map-popup">
      ${photo ? `<img src="${escapeHtml(photo.src)}" alt="${escapeHtml(circuit.name)}" width="240" height="135">` : ""}
      <div class="map-popup-body">
        <b>${escapeHtml(circuit.name)}</b>
        <span>${escapeHtml(circuit.country)}</span>
        ${race ? `<span>${escapeHtml(race.name)} · ${formatDate(race.date)}</span>` : ""}
        ${winner ? `<span>🏆 Winner: ${escapeHtml(winner)}</span>` : race && !isRaceFinished(race) ? `<span>🏁 Upcoming</span>` : ""}
      </div>
    </div>
  `;
}

export function showMap() {
  if (!window.L) {
    console.warn("Leaflet not loaded — circuit map skipped.");
    return;
  }

  if (!state.circuits.length) return;

  if (!map) {
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
  }

  // (re)draw markers — called again after live data updates winners
  markers.forEach(m => m.remove());
  markers = state.circuits.map(c => {
    const marker = L.marker([c.lat, c.lng], { title: c.name }).addTo(map);
    marker.bindPopup(popupHTML(c), { maxWidth: 260, minWidth: 240 });
    marker.on("mouseover", () => marker.openPopup());
    return marker;
  });
}
