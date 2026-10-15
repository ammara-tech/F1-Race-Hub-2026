// =====================================
// JOLPICA F1 API (free, no key) — https://github.com/jolpica/jolpica-f1
// Fetches the season's standings, schedule and results, and caches them
// in localStorage so the site still shows recent data when offline.
// =====================================

import { readStorage, writeStorage } from "../utils.js";

const BASE = "https://api.jolpi.ca/ergast/f1";
const CACHE_KEY = "f1LiveCache_v1";
const CACHE_MINUTES = 15;
const PAGE_SIZE = 100; // the API's maximum

async function getJSON(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${BASE}/${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Jolpica HTTP ${res.status} for ${path}`);
    return (await res.json()).MRData;
  } finally {
    clearTimeout(timeout);
  }
}

// Results endpoints are paged by result row, so one race can be split
// across two pages. Fetch every page and merge races by round.
async function getAllRaces(path, listKey) {
  const byRound = new Map();
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const data = await getJSON(`${path}?limit=${PAGE_SIZE}&offset=${offset}`);
    total = Number(data.total) || 0;

    for (const race of data.RaceTable?.Races || []) {
      const existing = byRound.get(race.round);
      if (existing) existing[listKey].push(...(race[listKey] || []));
      else byRound.set(race.round, { ...race, [listKey]: [...(race[listKey] || [])] });
    }

    offset += PAGE_SIZE;
  }

  return [...byRound.values()].sort((a, b) => a.round - b.round);
}

async function fetchSeason(season) {
  // One request at a time — the API is free and rate limited.
  const schedule = (await getJSON(`${season}.json?limit=${PAGE_SIZE}`)).RaceTable?.Races || [];
  const driverStandings =
    (await getJSON(`${season}/driverStandings.json`)).StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  const constructorStandings =
    (await getJSON(`${season}/constructorStandings.json`)).StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
  const results = await getAllRaces(`${season}/results.json`, "Results");
  const sprints = await getAllRaces(`${season}/sprint.json`, "SprintResults");

  return { season, schedule, driverStandings, constructorStandings, results, sprints };
}

/**
 * Returns { data, status, fetchedAt } where status is
 * "live" (fresh from the API), "cached" (recent copy) or "stale" (API failed,
 * using an older copy). Throws if there is no API and no cache.
 */
export async function loadLiveSeason(season, { force = false } = {}) {
  const cache = readStorage(CACHE_KEY, null);
  const cacheValid = cache?.data?.season === season;
  const ageMinutes = cacheValid ? (Date.now() - new Date(cache.fetchedAt)) / 60000 : Infinity;

  if (!force && cacheValid && ageMinutes < CACHE_MINUTES) {
    return { data: cache.data, status: "cached", fetchedAt: cache.fetchedAt };
  }

  try {
    const data = await fetchSeason(season);
    const fetchedAt = new Date().toISOString();
    writeStorage(CACHE_KEY, { fetchedAt, data });
    return { data, status: "live", fetchedAt };
  } catch (err) {
    console.warn("Live data unavailable:", err);
    if (cacheValid) return { data: cache.data, status: "stale", fetchedAt: cache.fetchedAt };
    throw err;
  }
}
