// =====================================
// SHARED APP STATE
// One place that holds the loaded data so every module reads the same copy.
// =====================================

export const DEFAULT_COLOR = "#E10600";

export const state = {
  drivers: [],
  teams: [],
  races: [],
  circuits: [],
  teamColors: {},

  // filled by js/api/live.js when the Jolpica API answers
  constructorStandings: [], // [{ team, points, position, wins }]
  live: { status: "offline", fetchedAt: null }
};

export function setData(data) {
  state.drivers = data.drivers || [];
  state.teams = data.teams || [];
  state.races = data.races || [];
  state.circuits = data.circuits || [];

  state.teamColors = {};
  state.teams.forEach(team => {
    state.teamColors[team.name] = team.color || DEFAULT_COLOR;
  });
}

export function teamColor(teamName) {
  return state.teamColors[teamName] || DEFAULT_COLOR;
}

export function findDriver(name) {
  return state.drivers.find(d => d.name === name) || null;
}

// Drivers ordered by championship position (live) or 2026 points (offline).
export function driversByPoints() {
  return [...state.drivers].sort((a, b) =>
    (a.position ?? 99) - (b.position ?? 99) ||
    (b.points2026 ?? 0) - (a.points2026 ?? 0)
  );
}

// Races that already have results, newest first.
export function completedRacesWithResults() {
  return state.races.filter(r => r.results?.length).sort((a, b) => b.date.localeCompare(a.date));
}
