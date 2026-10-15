// =====================================
// GALLERY & HISTORY page entry point
// =====================================

import { setData } from "./state.js";
import { loadImageCredits, allCredits } from "./images.js";
import { initTheme } from "./features/theme.js";
import { renderGallery, initGalleryFilters, initLightbox } from "./render/gallery.js";
import { renderHistory } from "./render/history.js";
import { renderCredits } from "./render/credits.js";

initTheme();

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
  return res.json();
}

async function init() {
  try {
    const [data, history] = await Promise.all([
      getJSON("./data/data.json"),
      getJSON("./data/history.json"),
      loadImageCredits()
    ]);

    setData(data);
    renderGallery();
    initGalleryFilters();
    initLightbox();
    renderHistory(history);
    renderCredits(allCredits());
  } catch (err) {
    console.error(err);
    const banner = document.createElement("div");
    banner.className = "load-error";
    banner.textContent = location.protocol === "file:"
      ? "Open this site with a local server (e.g. VS Code Live Server) — browsers block loading data on file:// pages."
      : "Couldn't load the gallery data.";
    document.body.prepend(banner);
  }
}

init();
