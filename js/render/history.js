// =====================================
// F1 HISTORY TIMELINE
// =====================================

import { escapeHtml } from "../utils.js";
import { imageFor } from "../images.js";

const container = document.getElementById("historyTimeline");

export function renderHistory(events) {
  if (!container) return;

  container.innerHTML = events.map(event => {
    const photo = event.image ? imageFor("history", event.image) : null;

    return `
      <li class="timeline-item ${photo ? "" : "no-photo"}">
        <div class="timeline-year">${escapeHtml(event.year)}</div>
        <div class="timeline-card">
          ${photo ? `
            <button type="button" class="timeline-media" data-group="history" data-key="${escapeHtml(event.image)}" aria-label="View larger photo">
              <img class="photo" src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.label)}" loading="lazy" decoding="async">
            </button>` : ""}
          <div class="timeline-text">
            <h3>${escapeHtml(event.title)}</h3>
            <p>${escapeHtml(event.text)}</p>
            ${photo ? `<p class="timeline-photo-label">Pictured: ${escapeHtml(photo.label)}</p>` : ""}
          </div>
        </div>
      </li>
    `;
  }).join("");
}
