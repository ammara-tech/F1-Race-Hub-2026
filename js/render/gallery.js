// =====================================
// GALLERY GRID + LIGHTBOX
// =====================================

import { state, teamColor } from "../state.js";
import { escapeHtml } from "../utils.js";
import { imageHTML, imageFor, creditLine } from "../images.js";

const container = document.getElementById("galleryContainer");
const filterBar = document.getElementById("galleryFilters");
const lightbox = document.getElementById("lightbox");
const lightboxBody = document.getElementById("lightboxBody");

// What each gallery group shows: image group, label, caption, colour
function groups() {
  return [
    {
      id: "drivers",
      title: "Drivers",
      sub: `All ${state.drivers.length} drivers on the 2026 grid.`,
      items: state.drivers.map(d => ({
        group: "drivers", key: d.name, title: `${d.flag ?? ""} ${d.name}`,
        caption: d.team, tag: d.number ? `#${d.number}` : "", color: teamColor(d.team), placeholder: "initials"
      }))
    },
    {
      id: "teams",
      title: "Teams",
      sub: "The eleven constructors of the 2026 season.",
      items: state.teams.map(t => ({
        group: "logos", key: t.name, title: t.name,
        caption: t.drivers.join(" · "), tag: "", color: t.color, placeholder: "logo"
      }))
    },
    {
      id: "cars",
      title: "2026 Cars",
      sub: "This year's all-new cars, built to the 2026 regulations.",
      items: state.teams.map(t => ({
        group: "cars", key: t.name, title: t.car || t.name,
        caption: `${t.name} · ${t.engine} power`, tag: "", color: t.color, placeholder: "car"
      }))
    },
    {
      id: "circuits",
      title: "Circuits",
      sub: `Every venue on the 2026 calendar.`,
      items: state.circuits.map(c => {
        const race = state.races.find(r => r.circuit === c.name);
        return {
          group: "circuits", key: c.name, title: c.name,
          caption: race ? `${c.country} · ${race.name}` : c.country, tag: "", color: "#E10600", placeholder: "plain"
        };
      })
    }
  ];
}

let activeGroup = "all";

function tileHTML(item) {
  return `
    <figure class="tile" style="--team:${escapeHtml(item.color)}">
      <button type="button" class="tile-media ${item.group === "logos" ? "logo-box" : ""}" data-group="${item.group}" data-key="${escapeHtml(item.key)}" aria-label="View larger: ${escapeHtml(item.title)}">
        ${imageHTML(item.group, item.key, {
          color: item.color,
          alt: item.group === "logos" ? `${item.title} logo` : item.title,
          placeholder: item.placeholder,
          className: item.group === "logos" ? "logo-img" : ""
        })}
        ${item.tag ? `<span class="tile-tag">${escapeHtml(item.tag)}</span>` : ""}
      </button>
      <figcaption>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.caption)}</span>
      </figcaption>
    </figure>
  `;
}

export function renderGallery() {
  if (!container) return;

  container.innerHTML = groups()
    .filter(g => activeGroup === "all" || g.id === activeGroup)
    .map(g => `
      <section class="gallery-group" id="gallery-${g.id}">
        <h3 class="section-heading gallery-title">${g.title}</h3>
        <p class="section-sub">${g.sub}</p>
        <div class="gallery-grid gallery-grid--${g.id}">
          ${g.items.map(tileHTML).join("")}
        </div>
      </section>
    `).join("");
}

export function initGalleryFilters() {
  filterBar?.addEventListener("click", event => {
    const chip = event.target.closest("[data-group]");
    if (!chip) return;

    activeGroup = chip.dataset.group;
    filterBar.querySelectorAll("[data-group]").forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
    renderGallery();
  });
}

export function openLightbox(group, key, title) {
  const info = imageFor(group, key);
  if (!info || !lightbox) return;

  lightboxBody.innerHTML = `
    <img class="lightbox-img" src="${escapeHtml(info.src)}" alt="${escapeHtml(title || key)}">
    <div class="lightbox-caption">
      <strong>${escapeHtml(title || key)}</strong>
      <p class="photo-credit">${creditLine(info)}</p>
    </div>
  `;
  lightbox.showModal();
}

export function initLightbox() {
  document.addEventListener("click", event => {
    const media = event.target.closest(".tile-media, .timeline-media");
    if (media) {
      const title = media.closest("figure, li")?.querySelector("strong, h3")?.textContent.trim();
      openLightbox(media.dataset.group, media.dataset.key, title);
    }
  });

  lightbox?.addEventListener("click", event => {
    if (event.target === lightbox || event.target.closest("[data-close]")) lightbox.close();
  });
}
