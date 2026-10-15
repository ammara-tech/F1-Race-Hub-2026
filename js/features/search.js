// =====================================
// DRIVER SEARCH
// =====================================

import { state } from "../state.js";
import { renderDrivers } from "../render/drivers.js";

const input = document.getElementById("searchInput");

export function filterDrivers(query) {
  const value = query.toLowerCase().trim();
  if (!value) return state.drivers;

  return state.drivers.filter(d =>
    d.name.toLowerCase().includes(value) ||
    d.team.toLowerCase().includes(value) ||
    (d.nationality && d.nationality.toLowerCase().includes(value))
  );
}

export function initSearch() {
  if (!input) return;

  input.addEventListener("input", () => {
    renderDrivers(filterDrivers(input.value));
  });
}
