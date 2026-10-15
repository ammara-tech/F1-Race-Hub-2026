// =====================================
// LIGHT / DARK MODE
// The saved choice is applied by a tiny inline script in <head> (so the page
// never flashes the wrong colours); this module wires up the toggle button.
// =====================================

import { readStorage, writeStorage } from "../utils.js";

const STORAGE_KEY = "f1Theme";

// Dark is the house style; light is opt-in via the toggle.
function currentTheme() {
  return document.documentElement.dataset.theme || "dark";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll(".theme-toggle").forEach(btn => {
    btn.setAttribute("aria-pressed", String(theme === "light"));
    btn.textContent = theme === "light" ? "☾ Dark" : "☀ Light";
    btn.title = `Switch to ${theme === "light" ? "dark" : "light"} mode`;
  });
}

export function initTheme() {
  applyTheme(readStorage(STORAGE_KEY, null) || currentTheme());

  document.addEventListener("click", event => {
    if (!event.target.closest(".theme-toggle")) return;
    const next = currentTheme() === "light" ? "dark" : "light";
    writeStorage(STORAGE_KEY, next);
    applyTheme(next);
  });
}
