// =====================================
// F1 RACE HUB — entry point
// Loads data.json, then hands it to each feature module.
// =====================================

import { state, setData } from "./state.js";

import { renderDrivers } from "./render/drivers.js";
import { renderTeams } from "./render/teams.js";
import { renderRaces } from "./render/races.js";
import { renderStandings } from "./render/standings.js";
import { renderStats } from "./render/stats.js";

import { startFeaturedRotation } from "./features/featured.js";
import { initFavourites } from "./features/favourites.js";
import { initSearch } from "./features/search.js";
import { initCompare } from "./features/compare.js";
import { startCountdown } from "./features/countdown.js";
import { showMap } from "./features/map.js";
import { initJoinFans } from "./features/join-fans.js";

const DATA_URL = "./data/data.json";

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

  if (!response.ok) {
    throw new Error(`${DATA_URL} not found (HTTP ${response.status})`);
  }

  return response.json();
}

async function init() {
  try {
    setData(await fetchData());
  } catch (err) {
    console.error("FETCH ERROR:", err);
    showLoadError();
    initJoinFans(); // the sign-up widget still works without data
    return;
  }

  renderStats();
  renderDrivers(state.drivers);
  renderTeams(state.teams);
  renderRaces(state.races);
  renderStandings();

  startFeaturedRotation();
  initFavourites();
  initSearch();
  initCompare();
  startCountdown();
  showMap();
  initJoinFans(state.teams);
}

init();
