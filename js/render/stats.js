// =====================================
// HOME STAT STRIP — computed from data.json so it never goes stale
// =====================================

import { state } from "../state.js";

function setStat(key, value) {
  const el = document.querySelector(`[data-stat="${key}"]`);
  if (el) el.textContent = value;
}

export function renderStats() {
  const countries = new Set(state.races.map(r => r.country));

  setStat("drivers", state.drivers.length);
  setStat("teams", state.teams.length);
  setStat("races", state.races.length);
  setStat("countries", countries.size);
}
