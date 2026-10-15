// =====================================
// LOCAL IMAGES (downloaded into images/ by scripts/download-images.mjs)
// data/image-credits.json lists which pictures exist, so we never render
// a broken <img>. Anything missing gets a styled placeholder instead.
// =====================================

import { escapeHtml, initials, slugify } from "./utils.js";

let credits = {};

export async function loadImageCredits() {
  try {
    const res = await fetch("./data/image-credits.json");
    if (res.ok) credits = await res.json();
  } catch {
    credits = {};
  }
  return credits;
}

export function allCredits() {
  return credits;
}

export function imageFor(group, nameOrSlug) {
  return credits[group]?.[slugify(nameOrSlug)] || null;
}

// Simple side-on car silhouette, tinted with the team colour.
export function carSilhouette(color) {
  return `
    <svg class="car-silhouette" viewBox="0 0 300 80" aria-hidden="true">
      <path fill="${color}" d="M10 52h32l20-18h46l6-10h48l6 10h40l42 14 8 6v8H226a22 22 0 0 0-42 0H96a22 22 0 0 0-42 0H10z"/>
      <rect fill="${color}" x="262" y="22" width="6" height="26"/>
      <rect fill="${color}" x="262" y="22" width="30" height="7"/>
      <circle cx="75" cy="60" r="16" fill="#111"/><circle cx="75" cy="60" r="7" fill="${color}"/>
      <circle cx="205" cy="60" r="16" fill="#111"/><circle cx="205" cy="60" r="7" fill="${color}"/>
    </svg>`;
}

/**
 * <img> for a local picture, or a placeholder when we don't have one.
 * options: { color, alt, className, placeholder: "initials" | "car" | "logo" | "plain" }
 */
export function imageHTML(group, name, options = {}) {
  const { color = "#E10600", alt = name, className = "", placeholder = "initials" } = options;
  const info = imageFor(group, name);

  if (info) {
    return `<img class="photo ${className}" src="${escapeHtml(info.src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" data-ph="${placeholder}" data-ph-color="${escapeHtml(color)}" data-ph-label="${escapeHtml(name)}">`;
  }

  return placeholderHTML(name, color, placeholder, className);
}

export function placeholderHTML(name, color, kind, className = "") {
  if (kind === "logo") {
    // team name as a word-mark in the team colour
    return `<div class="photo photo-ph photo-ph--logo ${className}" style="--ph:${escapeHtml(color)}"><span>${escapeHtml(name)}</span></div>`;
  }
  if (kind === "car") {
    return `<div class="photo photo-ph photo-ph--car ${className}">${carSilhouette(color)}</div>`;
  }
  const text = kind === "initials" ? initials(name) : "";
  return `<div class="photo photo-ph ${className}" style="--ph:${escapeHtml(color)}"><span>${escapeHtml(text)}</span></div>`;
}

// If an image file is deleted later, swap the broken <img> for a placeholder.
document.addEventListener("error", event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.ph) return;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = placeholderHTML(img.dataset.phLabel, img.dataset.phColor, img.dataset.ph, img.className.replace("photo", ""));
  img.replaceWith(wrapper.firstElementChild);
}, true);

export function creditLine(info) {
  if (!info) return "";
  const source = info.page
    ? ` · <a href="${escapeHtml(info.page)}" target="_blank" rel="noopener">Source</a>`
    : "";
  return `Image: ${escapeHtml(info.artist)} · ${escapeHtml(info.license)}${source}`;
}
