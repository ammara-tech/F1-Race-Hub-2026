// =====================================
// MERGE LIVE API DATA INTO THE APP STATE
// data.json stays the source for descriptions, flags, career stats and
// colours; the API supplies points, positions, results and start times.
// =====================================

import { state } from "../state.js";
import { normalizeName } from "../utils.js";
import { loadLiveSeason } from "./jolpica.js";

export const SEASON = 2026;

function lastName(name) {
  return normalizeName(name).split(/\s+/).pop();
}

function matchDriver(apiDriver) {
  const family = normalizeName(apiDriver.familyName);
  return (
    state.drivers.find(d => lastName(d.name) === family) ||
    state.drivers.find(d => String(d.number) === apiDriver.permanentNumber) ||
    null
  );
}

function matchTeam(apiConstructor) {
  const id = apiConstructor.constructorId;
  const name = normalizeName(apiConstructor.name);
  return (
    state.teams.find(t => t.apiIds?.includes(id)) ||
    state.teams.find(t => name.includes(normalizeName(t.name)) || normalizeName(t.name).includes(name)) ||
    null
  );
}

function driverLabel(apiDriver) {
  return matchDriver(apiDriver)?.name || `${apiDriver.givenName} ${apiDriver.familyName}`;
}

function teamLabel(apiConstructor) {
  return matchTeam(apiConstructor)?.name || apiConstructor.name;
}

function daysBetween(a, b) {
  return Math.abs(new Date(a) - new Date(b)) / 86400000;
}

// ---------- standings ----------

function applyDriverStandings(rows) {
  state.otherStandings = [];

  rows.forEach(row => {
    const driver = matchDriver(row.Driver);
    const entry = {
      position: Number(row.position || row.positionText) || null,
      points: Number(row.points) || 0,
      wins: Number(row.wins) || 0
    };

    if (driver) {
      driver.position = entry.position;
      driver.points2026 = entry.points;
      driver.wins2026 = entry.wins;
      driver.apiId = row.Driver.driverId;
    } else {
      // e.g. a stand-in driver who isn't in data.json
      state.otherStandings.push({
        ...entry,
        name: `${row.Driver.givenName} ${row.Driver.familyName}`,
        team: row.Constructors?.[0] ? teamLabel(row.Constructors[0]) : ""
      });
    }
  });
}

function applyConstructorStandings(rows) {
  state.constructorStandings = rows.map(row => ({
    team: teamLabel(row.Constructor),
    position: Number(row.position) || null,
    points: Number(row.points) || 0,
    wins: Number(row.wins) || 0
  }));
}

// ---------- calendar ----------

function findOurRace(apiRace) {
  const country = normalizeName(apiRace.Circuit?.Location?.country);
  const candidates = state.races
    .filter(r => normalizeName(r.country) === country)
    .filter(r => daysBetween(r.date, apiRace.date) <= 21)
    .sort((a, b) => daysBetween(a.date, apiRace.date) - daysBetween(b.date, apiRace.date));
  return candidates[0] || null;
}

function applySchedule(schedule) {
  schedule.forEach(apiRace => {
    let race = findOurRace(apiRace);

    if (!race) {
      // A race the API knows about but data.json doesn't — add it.
      race = {
        name: apiRace.raceName,
        country: apiRace.Circuit?.Location?.country || "",
        circuit: apiRace.Circuit?.circuitName || "",
        duration: ""
      };
      state.races.push(race);
    }

    race.round = Number(apiRace.round);
    race.date = apiRace.date;
    race.time = apiRace.time || null;
    race.sprint = race.sprint || Boolean(apiRace.Sprint);
    race.apiName = apiRace.raceName;
  });

  state.races.sort((a, b) => a.date.localeCompare(b.date));
}

// ---------- results ----------

function mapResult(row) {
  return {
    position: Number(row.position),
    positionText: row.positionText,
    name: driverLabel(row.Driver),
    team: teamLabel(row.Constructor),
    points: Number(row.points) || 0,
    status: row.status,
    time: row.Time?.time || null,
    grid: Number(row.grid) || null
  };
}

function applyResults(results, sprints) {
  const byRound = new Map(state.races.map(r => [String(r.round), r]));

  results.forEach(apiRace => {
    const race = byRound.get(apiRace.round);
    if (race) race.results = apiRace.Results.map(mapResult).sort((a, b) => a.position - b.position);
  });

  sprints.forEach(apiRace => {
    const race = byRound.get(apiRace.round);
    if (race) race.sprintResults = apiRace.SprintResults.map(mapResult).sort((a, b) => a.position - b.position);
  });

  // Cumulative points after each round, per driver (for the profile chart)
  state.drivers.forEach(d => { d.pointsHistory = []; d.bestFinish2026 = null; });

  const rounds = state.races.filter(r => r.results?.length).sort((a, b) => a.round - b.round);
  const totals = new Map();

  rounds.forEach(race => {
    const gained = new Map();
    [...race.results, ...(race.sprintResults || [])].forEach(r => {
      gained.set(r.name, (gained.get(r.name) || 0) + r.points);
    });

    state.drivers.forEach(d => {
      const total = (totals.get(d.name) || 0) + (gained.get(d.name) || 0);
      totals.set(d.name, total);

      const finish = race.results.find(r => r.name === d.name);
      d.pointsHistory.push({
        round: race.round,
        race: race.apiName || race.name,
        total,
        finish: finish?.positionText ?? "–"
      });

      if (finish && Number.isFinite(finish.position)) {
        d.bestFinish2026 = Math.min(d.bestFinish2026 ?? 99, finish.position);
      }
    });
  });
}

// ---------- entry point ----------

export async function loadLive({ force = false } = {}) {
  try {
    const { data, status, fetchedAt } = await loadLiveSeason(SEASON, { force });

    applySchedule(data.schedule);
    applyDriverStandings(data.driverStandings);
    applyConstructorStandings(data.constructorStandings);
    applyResults(data.results, data.sprints);

    state.live = { status, fetchedAt };
  } catch {
    state.live = { status: "offline", fetchedAt: null };
  }

  return state.live;
}
