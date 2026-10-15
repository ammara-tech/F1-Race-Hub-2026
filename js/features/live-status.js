// =====================================
// "LIVE DATA" STATUS PILL + REFRESH BUTTON
// =====================================

import { state } from "../state.js";
import { timeAgo } from "../utils.js";

const LABELS = {
  live: "Live data — synced {ago} from the Jolpica F1 API",
  cached: "Live data — synced {ago} from the Jolpica F1 API",
  stale: "Showing data from {ago} — the F1 API isn't responding right now",
  offline: "Offline — showing the saved 2026 data (live API unavailable)",
  loading: "Fetching the latest results…"
};

export function renderLiveStatus(statusOverride) {
  const status = statusOverride || state.live.status;
  const ago = state.live.fetchedAt ? timeAgo(state.live.fetchedAt) : "";

  document.querySelectorAll(".live-status").forEach(el => {
    el.dataset.status = status;
    el.querySelector(".live-text").textContent = LABELS[status].replace("{ago}", ago);
  });
}

export function initLiveStatus(onRefresh) {
  document.addEventListener("click", async event => {
    const btn = event.target.closest(".live-refresh");
    if (!btn) return;

    btn.disabled = true;
    renderLiveStatus("loading");
    await onRefresh();
    btn.disabled = false;
  });

  // keep "x min ago" fresh
  setInterval(() => renderLiveStatus(), 60000);
}
