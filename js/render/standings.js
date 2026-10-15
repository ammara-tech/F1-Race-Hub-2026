// =====================================
// CHAMPIONSHIP STANDINGS — official points from the API,
// or the 2026 points in data.json when offline.
// =====================================

import { state, teamColor, driversByPoints } from "../state.js";
import { escapeHtml } from "../utils.js";

const container = document.getElementById("standingsContainer");
const tabs = document.getElementById("standingsTabs");

let view = "drivers";
let showAll = false;
const TOP_N = 10;

function rowHTML({ rank, title, subtitle, points, color, max, highlight }) {
  const widthPct = Math.max(4, Math.round((points / (max || 1)) * 100));
  return `
    <div class="standing-row ${highlight ? "p1" : ""}">
      <div class="standing-rank">${rank}</div>
      <div class="standing-name">${title}<small>${subtitle}</small></div>
      <div class="standing-pts" style="color:${color}">${points}<span> pts</span></div>
      <div class="standing-bar-track">
        <div class="standing-bar-fill" style="width:${widthPct}%; background:${color}"></div>
      </div>
    </div>
  `;
}

function driverRows() {
  const drivers = driversByPoints();
  const extra = (state.otherStandings || []).map(o => ({ ...o, points2026: o.points, flag: "", wins2026: o.wins }));
  const all = [...drivers, ...extra].sort((a, b) =>
    (a.position ?? 99) - (b.position ?? 99) || (b.points2026 ?? 0) - (a.points2026 ?? 0)
  );
  const max = all[0]?.points2026 || 1;

  return all.slice(0, showAll ? all.length : TOP_N).map((d, i) => rowHTML({
    rank: d.position ?? i + 1,
    title: `${d.flag ?? ""} ${escapeHtml(d.name)}`,
    subtitle: `${escapeHtml(d.team)}${d.wins2026 ? ` · ${d.wins2026} win${d.wins2026 > 1 ? "s" : ""}` : ""}`,
    points: d.points2026 ?? 0,
    color: teamColor(d.team),
    max,
    highlight: i === 0
  })).join("");
}

function constructorRows() {
  let rows = state.constructorStandings;

  // Offline: add up each team's drivers from data.json
  if (!rows.length) {
    rows = state.teams
      .map(t => ({
        team: t.name,
        points: state.drivers.filter(d => d.team === t.name).reduce((sum, d) => sum + (d.points2026 ?? 0), 0),
        wins: 0
      }))
      .sort((a, b) => b.points - a.points)
      .map((r, i) => ({ ...r, position: i + 1 }));
  }

  const max = rows[0]?.points || 1;
  return rows.map((r, i) => {
    const team = state.teams.find(t => t.name === r.team);
    return rowHTML({
      rank: r.position ?? i + 1,
      title: escapeHtml(r.team),
      subtitle: `${team ? escapeHtml(team.drivers.join(" · ")) : ""}${r.wins ? ` · ${r.wins} win${r.wins > 1 ? "s" : ""}` : ""}`,
      points: r.points,
      color: teamColor(r.team),
      max,
      highlight: i === 0
    });
  }).join("");
}

export function renderStandings() {
  if (!container) return;

  if (!state.drivers.length) {
    container.innerHTML = "<p>No driver data loaded.</p>";
    return;
  }

  const total = state.drivers.length + (state.otherStandings?.length || 0);
  const toggle = view === "drivers" && total > TOP_N
    ? `<button type="button" class="ghost small standings-more">${showAll ? "Show top 10" : `Show all ${total} drivers`}</button>`
    : "";

  container.innerHTML = `<div class="standings-list">${view === "drivers" ? driverRows() : constructorRows()}</div>${toggle}`;
}

export function initStandingsTabs() {
  container?.addEventListener("click", event => {
    if (!event.target.closest(".standings-more")) return;
    showAll = !showAll;
    renderStandings();
  });

  tabs?.addEventListener("click", event => {
    const tab = event.target.closest("[data-view]");
    if (!tab) return;

    view = tab.dataset.view;
    tabs.querySelectorAll("[data-view]").forEach(t => t.setAttribute("aria-pressed", String(t === tab)));
    renderStandings();
  });
}
