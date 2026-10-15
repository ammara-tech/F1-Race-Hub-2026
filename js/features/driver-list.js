// =====================================
// DRIVER SEARCH + SORT (they work together on the same grid)
// =====================================

import { state } from "../state.js";
import { renderDrivers } from "../render/drivers.js";

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("driverSort");

const SORTERS = {
  points: (a, b) => (b.points2026 ?? 0) - (a.points2026 ?? 0),
  wins: (a, b) => b.wins - a.wins || b.worldChampionships - a.worldChampionships,
  titles: (a, b) => b.worldChampionships - a.worldChampionships || b.wins - a.wins,
  number: (a, b) => (a.number ?? 999) - (b.number ?? 999),
  name: (a, b) => a.name.localeCompare(b.name),
  team: (a, b) => a.team.localeCompare(b.team) || a.name.localeCompare(b.name)
};

export function filterDrivers(query) {
  const value = query.toLowerCase().trim();
  if (!value) return [...state.drivers];

  return state.drivers.filter(d =>
    d.name.toLowerCase().includes(value) ||
    d.team.toLowerCase().includes(value) ||
    (d.nationality && d.nationality.toLowerCase().includes(value))
  );
}

export function refreshDriverList() {
  const list = filterDrivers(searchInput?.value || "");
  const sorter = SORTERS[sortSelect?.value] || SORTERS.points;
  renderDrivers(list.sort(sorter));
}

export function initDriverList() {
  searchInput?.addEventListener("input", refreshDriverList);
  sortSelect?.addEventListener("change", refreshDriverList);
  refreshDriverList();
}
