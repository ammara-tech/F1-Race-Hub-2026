// =====================================
// FEATURED DRIVER — rotates every 10 seconds
// =====================================

import { state } from "../state.js";
import { driverCardHTML } from "../render/drivers.js";

const container = document.getElementById("featuredDriverCard");
const ROTATE_MS = 10000;

let lastIndex = -1;
let timer = null;

function pickIndex() {
  const count = state.drivers.length;
  if (count < 2) return 0;

  // never show the same driver twice in a row
  let i;
  do {
    i = Math.floor(Math.random() * count);
  } while (i === lastIndex);
  return i;
}

export function renderFeaturedDriver() {
  if (!container || !state.drivers.length) return;

  lastIndex = pickIndex();
  container.innerHTML = driverCardHTML(state.drivers[lastIndex], { full: false });
}

export function startFeaturedRotation() {
  renderFeaturedDriver();
  clearInterval(timer);
  timer = setInterval(renderFeaturedDriver, ROTATE_MS);
}
