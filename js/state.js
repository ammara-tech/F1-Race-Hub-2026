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
  teamColors: {}
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
