// =====================================
// LIVE DATA — standalone module
//
// Pulls current-season driver/constructor standings and the last
// race result from the free, open Jolpica F1 API (the community
// successor to the now-shut-down Ergast API: https://api.jolpi.ca).
//
// Design notes / honesty about limitations:
// - This runs entirely in the visitor's browser. There is no backend,
//   so results are cached in localStorage (see CACHE_TTL_MS below)
//   instead of hitting the API on every page load.
// - Jolpica's terms ask API consumers to set a descriptive
//   User-Agent header. Browsers do not allow client-side JS to set
//   that header on fetch() requests (it's a forbidden header name),
//   so this can't fully comply — that's a real constraint of calling
//   a public API straight from a static site rather than a proxy
//   server you control. If this app needs to be a heavier consumer
//   later, the right fix is a small backend/proxy that sets the
//   header, caches server-side, and enforces the rate limit.
// - If the network call fails for ANY reason (offline, CORS, rate
//   limit, API downtime), this module leaves the site exactly as it
//   was rendered from data.json — it never breaks the page, it just
//   stays on the last known snapshot and says so.
//
// Depends on window.F1Hub (exposed by script.js) and the render
// functions script.js already defines globally (renderDrivers,
// renderTeams, renderStandings). Does not touch data.json.
// =====================================

(function () {
  const API_BASE = "https://api.jolpi.ca/ergast/f1";
  const CACHE_KEY = "f1LiveDataCache_v1";
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — be polite to a volunteer-run API

  const statusEl = document.getElementById("liveStatusNote");
  const lastRaceEl = document.getElementById("lastRaceCard");

  // Ergast/Jolpica driverId -> our local driver "Full Name", so we can
  // merge live stats onto the right card even when the API's given/
  // family name doesn't literally match our data.json string.
  const DRIVER_ID_MAP = {
    max_verstappen: "Max Verstappen",
    hadjar: "Isack Hadjar",
    leclerc: "Charles Leclerc",
    hamilton: "Lewis Hamilton",
    norris: "Lando Norris",
    piastri: "Oscar Piastri",
    russell: "George Russell",
    antonelli: "Kimi Antonelli",
    alonso: "Fernando Alonso",
    stroll: "Lance Stroll",
    gasly: "Pierre Gasly",
    colapinto: "Franco Colapinto",
    albon: "Alexander Albon",
    sainz: "Carlos Sainz",
    hulkenberg: "Nico Hulkenberg",
    bortoleto: "Gabriel Bortoleto",
    lawson: "Liam Lawson",
    lindblad: "Arvid Lindblad",
    ocon: "Esteban Ocon",
    bearman: "Oliver Bearman",
    perez: "Sergio Perez",
    bottas: "Valtteri Bottas"
  };

  const TEAM_ID_MAP = {
    red_bull: "Red Bull Racing",
    ferrari: "Ferrari",
    mclaren: "McLaren",
    mercedes: "Mercedes",
    aston_martin: "Aston Martin",
    alpine: "Alpine",
    williams: "Williams",
    haas: "Haas",
    rb: "Racing Bulls",
    racing_bulls: "Racing Bulls",
    sauber: "Audi",
    audi: "Audi",
    cadillac: "Cadillac F1"
  };

  function setStatus(text, tone) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = `live-status live-status--${tone}`;
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.timestamp) return null;
      return parsed;
    } catch (err) {
      return null;
    }
  }

  function writeCache(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, timestamp: Date.now() }));
    } catch (err) {
      // localStorage full or unavailable — live data still works, just won't be cached
      console.warn("Could not cache live F1 data:", err);
    }
  }

  async function fetchJson(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
    return res.json();
  }

  async function fetchLiveBundle() {
    const [standingsData, constructorData, lastRaceData] = await Promise.all([
      fetchJson("/current/driverStandings.json"),
      fetchJson("/current/constructorStandings.json"),
      fetchJson("/current/last/results.json")
    ]);

    const standingsList =
      standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

    const constructorList =
      constructorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

    const lastRace = lastRaceData?.MRData?.RaceTable?.Races?.[0] || null;

    return { standingsList, constructorList, lastRace };
  }

  function applyDriverStandings(standingsList) {
    const drivers = window.F1Hub?.drivers;
    if (!drivers || !standingsList.length) return false;

    let matched = 0;

    standingsList.forEach(entry => {
      const driverId = entry.Driver?.driverId;
      const fullName =
        DRIVER_ID_MAP[driverId] ||
        `${entry.Driver?.givenName || ""} ${entry.Driver?.familyName || ""}`.trim();

      const localDriver = drivers.find(
        d => d.name.toLowerCase() === fullName.toLowerCase()
      );

      if (localDriver) {
        localDriver.points2026 = Number(entry.points) || 0;
        localDriver.winsThisSeason = Number(entry.wins) || 0;
        matched++;
      }
    });

    return matched > 0;
  }

  function applyConstructorStandings(constructorList) {
    const teams = window.F1Hub?.teams;
    if (!teams || !constructorList.length) return false;

    let matched = 0;

    constructorList.forEach(entry => {
      const constructorId = entry.Constructor?.constructorId;
      const mappedName = TEAM_ID_MAP[constructorId];
      const apiName = entry.Constructor?.name;

      const localTeam = teams.find(
        t => t.name === mappedName || t.name.toLowerCase() === (apiName || "").toLowerCase()
      );

      if (localTeam) {
        localTeam.points2026 = Number(entry.points) || 0;
        matched++;
      }
    });

    return matched > 0;
  }

  function renderLastRace(lastRace) {
    if (!lastRaceEl) return;

    if (!lastRace || !lastRace.Results?.length) {
      lastRaceEl.innerHTML = "<p>No completed race data available yet.</p>";
      return;
    }

    const top3 = lastRace.Results.slice(0, 3);
    const raceDate = lastRace.date;

    lastRaceEl.innerHTML = `
      <h3>${lastRace.raceName} (Round ${lastRace.round})</h3>
      <p>${lastRace.Circuit?.circuitName || ""} · ${raceDate}</p>
      <div class="podium">
        ${top3.map(r => `
          <div class="podium-row podium-row--p${r.position}">
            <span class="podium-pos">P${r.position}</span>
            <span class="podium-name">${r.Driver.givenName} ${r.Driver.familyName}</span>
            <span class="podium-team">${r.Constructor?.name || ""}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function refreshUI() {
    if (!window.F1Hub) return;

    // Respect an active search filter instead of clobbering it
    const searchInput = document.getElementById("searchInput");
    const query = (searchInput?.value || "").toLowerCase().trim();
    const driverList = !query
      ? window.F1Hub.drivers
      : window.F1Hub.drivers.filter(d =>
          d.name.toLowerCase().includes(query) ||
          d.team.toLowerCase().includes(query) ||
          (d.nationality && d.nationality.toLowerCase().includes(query))
        );

    if (typeof window.renderDrivers === "function") window.renderDrivers(driverList);
    if (typeof window.renderTeams === "function") window.renderTeams(window.F1Hub.teams);
    if (typeof window.renderStandings === "function") window.renderStandings();
  }

  function formatAge(ms) {
    const mins = Math.round(ms / 60000);
    if (mins < 1) return "moments ago";
    if (mins === 1) return "1 minute ago";
    return `${mins} minutes ago`;
  }

  async function syncLiveData() {
    const cached = readCache();
    const cacheIsFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

    if (cacheIsFresh) {
      applyDriverStandings(cached.standingsList || []);
      applyConstructorStandings(cached.constructorList || []);
      renderLastRace(cached.lastRace);
      refreshUI();
      setStatus(`🟢 Live data — synced ${formatAge(Date.now() - cached.timestamp)} (cached)`, "live");
      return;
    }

    try {
      const { standingsList, constructorList, lastRace } = await fetchLiveBundle();

      const driversMatched = applyDriverStandings(standingsList);
      applyConstructorStandings(constructorList);
      renderLastRace(lastRace);
      refreshUI();

      writeCache({ standingsList, constructorList, lastRace });

      if (driversMatched) {
        setStatus("🟢 Live data — synced just now from the Jolpica F1 API", "live");
      } else {
        setStatus("🟡 Connected to live API, but couldn't match driver names — showing saved snapshot", "cached");
      }
    } catch (err) {
      console.warn("Live F1 data unavailable, staying on data.json snapshot:", err);

      if (cached) {
        // Fall back to a stale cache rather than nothing
        applyDriverStandings(cached.standingsList || []);
        applyConstructorStandings(cached.constructorList || []);
        renderLastRace(cached.lastRace);
        refreshUI();
        setStatus(`🟡 Live API unreachable — showing cache from ${formatAge(Date.now() - cached.timestamp)}`, "cached");
      } else {
        if (lastRaceEl) lastRaceEl.innerHTML = "<p>Live race data unavailable right now — showing the built-in season snapshot instead.</p>";
        setStatus("🟡 Live API unreachable — showing the built-in season snapshot", "cached");
      }
    }
  }

  function init() {
    if (window.f1HubDataReady) {
      syncLiveData();
    } else {
      document.addEventListener("f1hub:data-ready", syncLiveData, { once: true });
    }
  }

  init();
})();
