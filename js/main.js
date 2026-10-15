// =====================================
// F1 RACE HUB — home page entry point
// 1. load data.json + image list and render straight away
// 2. fetch live standings/results from the Jolpica API and re-render
// =====================================

import { state, setData } from "./state.js";
import { loadImageCredits } from "./images.js";
import { loadLive } from "./api/live.js";

import { renderTeams } from "./render/teams.js";
import { renderRaces, initRaceFilters } from "./render/races.js";
import { renderStandings, initStandingsTabs } from "./render/standings.js";
import { renderLastResult } from "./render/results.js";
import { renderStats } from "./render/stats.js";

import { initTheme } from "./features/theme.js";
import { startFeaturedRotation } from "./features/featured.js";
import { initFavourites, renderFavourites } from "./features/favourites.js";
import { initDriverList, refreshDriverList } from "./features/driver-list.js";
import { initDriverModal } from "./features/driver-modal.js";
import { initCompare } from "./features/compare.js";
import { startCountdown } from "./features/countdown.js";
import { initCalendarExport } from "./features/calendar-export.js";
import { initPredictor, renderPredictor } from "./features/predictions.js";
import { showMap } from "./features/map.js";
import { initJoinFans } from "./features/join-fans.js";
import { initLiveStatus, renderLiveStatus } from "./features/live-status.js";

const DATA_URL = "./data/data.json";

initTheme();

function showLoadError() {
  const isFile = location.protocol === "file:";

  const banner = document.createElement("div");
  banner.className = "load-error";
  banner.textContent = isFile
    ? "Couldn't load the F1 data. Browsers block fetch() on file:// pages — open the site with a local server (e.g. VS Code Live Server)."
    : "Couldn't load data/data.json — check that the file exists and is valid JSON.";

  document.body.prepend(banner);
}

async function fetchData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`${DATA_URL} not found (HTTP ${response.status})`);
  return response.json();
}

// Everything that depends on points, results or race dates
function renderLiveParts() {
  renderStats();
  refreshDriverList();
  renderTeams(state.teams);
  renderStandings();
  renderLastResult();
  renderRaces();
  renderFavourites();
  renderPredictor();
  startCountdown();
  showMap();
  renderLiveStatus();
}

async function refreshLive(force = false) {
  await loadLive({ force });
  renderLiveParts();
}

async function init() {
  let data;
  try {
    [data] = await Promise.all([fetchData(), loadImageCredits()]);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    showLoadError();
    initJoinFans(); // the sign-up widget still works without data
    return;
  }

  setData(data);

  // first paint from local data
  initDriverList();
  initDriverModal();
  initFavourites();
  initCompare();
  initStandingsTabs();
  initRaceFilters();
  initCalendarExport();
  initPredictor();
  initJoinFans(state.teams);
  initLiveStatus(() => refreshLive(true));
  startFeaturedRotation();
  renderLiveStatus("loading");
  renderLiveParts();
  renderLiveStatus("loading");

  // then upgrade with live data
  await refreshLive();
}

init();
