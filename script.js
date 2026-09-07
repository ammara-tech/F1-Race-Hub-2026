// =====================================
// DOM ELEMENTS
// =====================================

const driversContainer = document.getElementById("driversContainer");
const teamsContainer = document.getElementById("teamsContainer");
const racesContainer = document.getElementById("racesContainer");
const favouriteDriver = document.getElementById("favouriteDriver");
const searchInput = document.getElementById("searchInput");
const featuredDriverCard = document.getElementById("featuredDriverCard");
const countdown = document.getElementById("countdown");
const standingsContainer = document.getElementById("standingsContainer");

let drivers = [];
let teams = [];
let races = [];
let circuits = [];
let teamColors = {};

// =====================================
// FETCH DATA
// =====================================

async function fetchData() {
  try {
    const response = await fetch("./data.json");

    if (!response.ok) {
      throw new Error(`data.json not found (HTTP ${response.status})`);
    }

    const data = await response.json();

    drivers = data.drivers || [];
    teams = data.teams || [];
    races = data.races || [];
    circuits = data.circuits || [];

    teamColors = {};
    teams.forEach(t => { teamColors[t.name] = t.color || "#E10600"; });

    renderDrivers(drivers);
    renderTeams(teams);
    renderRaces(races);
    renderFeaturedDriver();
    renderFavourites();
    renderStandings();
    startCountdown();
    showMap();

  } catch (err) {
    console.error("FETCH ERROR:", err);

    document.body.insertAdjacentHTML(
      "afterbegin",
      `
      <div style="
        background:#E10600;
        color:white;
        padding:15px;
        font-weight:bold;
        text-align:center;
        font-family:'Titillium Web',Arial,sans-serif;
      ">
        Failed to load data.json — check that it sits alongside index.html.
      </div>
      `
    );
  }
}

// =====================================
// RENDER DRIVERS
// =====================================

function renderDrivers(driverList) {
  if (!driversContainer) return;

  driversContainer.innerHTML = "";

  if (!driverList.length) {
    driversContainer.innerHTML = "<p>No drivers match your search.</p>";
    return;
  }

  driverList.forEach(driver => {
    const color = teamColors[driver.team] || "#E10600";

    driversContainer.innerHTML += `
      <div class="card driver-card" style="border-left-color:${color}">
        <div class="car-number">${driver.number ?? ""}</div>

        <h3><span class="flag">${driver.flag ?? ""}</span>${driver.name}</h3>
        <span class="team-tag" style="background:${color}">${driver.team}</span>

        <p><strong>Nationality:</strong> ${driver.nationality}</p>
        <p>🏁 Career Wins: ${driver.wins}</p>
        <p>🏆 Championships: ${driver.worldChampionships}</p>
        <p>📅 Title Years: ${
          driver.championshipYears?.length
            ? driver.championshipYears.join(", ")
            : "None"
        }</p>
        ${driver.points2026 !== undefined ? `<p>📊 2026 Points: ${driver.points2026}</p>` : ""}

        <p class="desc">${driver.description}</p>

        <button onclick="saveFavourite('${driver.name.replace(/'/g, "\\'")}')">
          ⭐ Add to Favourites
        </button>
      </div>
    `;
  });
}

// =====================================
// RENDER TEAMS
// =====================================

function renderTeams(list) {
  if (!teamsContainer) return;

  teamsContainer.innerHTML = "";

  list.forEach(team => {
    teamsContainer.innerHTML += `
      <div class="card team-card" style="border-left-color:${team.color || "#E10600"}">
        <div class="team-swatch" style="background:${team.color || "#E10600"}"></div>
        <h3>${team.name}</h3>
        <p><strong>Drivers:</strong> ${team.drivers.join(", ")}</p>
        ${team.engine ? `<p><strong>Power Unit:</strong> ${team.engine}</p>` : ""}
        <p>${team.description}</p>
      </div>
    `;
  });
}

// =====================================
// RENDER RACES
// =====================================

function renderRaces(list) {
  if (!racesContainer) return;

  racesContainer.innerHTML = "";

  const now = new Date();

  list.forEach(race => {
    const isPast = new Date(race.date + "T00:00:00") < now;

    racesContainer.innerHTML += `
      <div class="card">
        <h3>${race.round ? `#${race.round} ` : ""}${race.name}</h3>
        <p>🌍 ${race.country}</p>
        <p>🏁 ${race.circuit}</p>
        <p>📅 ${race.date}</p>
        <p>⏱ ${race.duration}</p>
        ${race.sprint ? `<p>⚡ Sprint Weekend</p>` : ""}
        <p><strong>${isPast ? "Completed" : "Upcoming"}</strong></p>
      </div>
    `;
  });
}

// =====================================
// FEATURED DRIVER
// =====================================

function renderFeaturedDriver() {
  if (!drivers.length || !featuredDriverCard) return;

  const driver = drivers[Math.floor(Math.random() * drivers.length)];
  const color = teamColors[driver.team] || "#E10600";

  featuredDriverCard.innerHTML = `
    <div class="card driver-card" style="border-left-color:${color}">
      <div class="car-number">${driver.number ?? ""}</div>
      <h3><span class="flag">${driver.flag ?? ""}</span>${driver.name}</h3>
      <span class="team-tag" style="background:${color}">${driver.team}</span>
      <p class="desc">${driver.description}</p>
    </div>
  `;
}

// auto refresh featured driver
setInterval(() => {
  if (drivers.length) renderFeaturedDriver();
}, 10000);

// =====================================
// FAVOURITE SYSTEM
// =====================================

function saveFavourite(driverName) {
  let favourites = JSON.parse(localStorage.getItem("favouriteDrivers")) || [];

  const driver = drivers.find(d => d.name === driverName);
  if (!driver) return;

  if (!favourites.some(f => f.name === driverName)) {
    favourites.push({
      name: driver.name,
      team: driver.team,
      wins: driver.wins,
      championships: driver.worldChampionships
    });
    localStorage.setItem("favouriteDrivers", JSON.stringify(favourites));
  }

  renderFavourites();
}

function removeSingleFavourite(name) {
  let favourites = JSON.parse(localStorage.getItem("favouriteDrivers")) || [];
  favourites = favourites.filter(d => d.name !== name);
  localStorage.setItem("favouriteDrivers", JSON.stringify(favourites));
  renderFavourites();
}

function renderFavourites() {
  if (!favouriteDriver) return;

  const favourites = JSON.parse(localStorage.getItem("favouriteDrivers")) || [];

  if (!favourites.length) {
    favouriteDriver.innerHTML = "No favourite drivers selected yet.";
    return;
  }

  favouriteDriver.innerHTML = "<h3>⭐ My Favourite Drivers</h3>";

  favourites.forEach(d => {
    const color = teamColors[d.team] || "#E10600";
    favouriteDriver.innerHTML += `
      <div class="fav-card" style="border-left:3px solid ${color}">
        <div>
          <h4>${d.name}</h4>
          <p>🏎 ${d.team} · 🏁 ${d.wins} wins · 🏆 ${d.championships} titles</p>
        </div>
        <button onclick="removeSingleFavourite('${d.name.replace(/'/g, "\\'")}')">Remove</button>
      </div>
    `;
  });
}

// =====================================
// SEARCH
// =====================================

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();

    const filtered = drivers.filter(d =>
      d.name.toLowerCase().includes(value) ||
      d.team.toLowerCase().includes(value) ||
      (d.nationality && d.nationality.toLowerCase().includes(value))
    );

    renderDrivers(filtered);
  });
}

// =====================================
// COUNTDOWN
// =====================================

function startCountdown() {
  if (!countdown || !races.length) return;

  function updateCountdown() {
    const now = new Date();

    const nextRace = races.find(race => {
      const raceDate = new Date(race.date + "T00:00:00");
      return raceDate >= now;
    });

    if (!nextRace) {
      countdown.innerHTML = `
        <h3>🏁 2026 Season Complete!</h3>
        <p>See you next season.</p>
      `;
      return;
    }

    const raceDate = new Date(nextRace.date + "T00:00:00");
    const diff = raceDate - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdown.innerHTML = `
      <h3>${nextRace.name}</h3>
      <p>${nextRace.circuit} · ${nextRace.country}</p>
      <p><strong>${nextRace.date}</strong></p>
      <div class="countdown-timer">${days}d ${hours}h ${minutes}m ${seconds}s</div>
    `;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// =====================================
// MAP
// =====================================

function showMap() {
  if (!window.L) {
    console.warn("Leaflet not loaded");
    return;
  }

  if (!circuits.length) return;

  const map = L.map("map").setView([20, 10], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  circuits.forEach(c => {
    const marker = L.marker([c.lat, c.lng]).addTo(map);

    marker.bindPopup(`<b>${c.name}</b><br>${c.country}<br>🏁 F1 Circuit`);

    marker.on("mouseover", () => marker.openPopup());
  });
}

// =====================================
// STANDINGS (weighted score, clearly labelled as unofficial)
// =====================================

function renderStandings() {
  if (!standingsContainer) return;

  if (!drivers.length) {
    standingsContainer.innerHTML = "<p>No driver data loaded.</p>";
    return;
  }

  const scored = drivers.map(d => ({
    ...d,
    score: (d.points2026 ?? 0) + d.wins * 3 + d.worldChampionships * 20
  }));

  scored.sort((a, b) => b.score - a.score);

  const maxScore = scored[0].score || 1;

  standingsContainer.innerHTML = `<div class="standings-list">${
    scored.map((d, i) => {
      const color = teamColors[d.team] || "#E10600";
      const widthPct = Math.max(6, Math.round((d.score / maxScore) * 100));

      return `
        <div class="standing-row ${i === 0 ? "p1" : ""}">
          <div class="standing-rank">${i + 1}</div>
          <div class="standing-name">
            ${d.flag ?? ""} ${d.name}
            <small>${d.team}${d.points2026 !== undefined ? ` · ${d.points2026} pts (2026)` : ""}</small>
          </div>
          <div class="standing-pts" style="color:${color}">${d.score}</div>
          <div class="standing-bar-track">
            <div class="standing-bar-fill" style="width:${widthPct}%; background:${color}"></div>
          </div>
        </div>
      `;
    }).join("")
  }</div>`;
}

// =====================================
// COMPARE
// =====================================

function compareDrivers() {
  const aName = document.getElementById("driverA").value.toLowerCase().trim();
  const bName = document.getElementById("driverB").value.toLowerCase().trim();
  const result = document.getElementById("compareResult");

  const a = drivers.find(d => d.name.toLowerCase().includes(aName));
  const b = drivers.find(d => d.name.toLowerCase().includes(bName));

  if (!aName || !bName || !a || !b) {
    result.innerHTML = `<div class="card">❌ Please enter two valid driver names.</div>`;
    return;
  }

  const scoreA = (a.points2026 ?? 0) + a.wins * 3 + a.worldChampionships * 20;
  const scoreB = (b.points2026 ?? 0) + b.wins * 3 + b.worldChampionships * 20;

  const winner = scoreA > scoreB ? a.name : b.name;

  result.innerHTML = `
    <div class="card">
      <h3>🏁 ${a.name} vs ${b.name}</h3>
      <p>${a.name}: ${a.wins} wins · ${a.worldChampionships} titles · ${a.points2026 ?? 0} pts (2026)</p>
      <p>${b.name}: ${b.wins} wins · ${b.worldChampionships} titles · ${b.points2026 ?? 0} pts (2026)</p>
      <div class="winner">🏆 ${winner} leads the duel</div>
    </div>
  `;
}

// =====================================
// INIT
// =====================================

fetchData();
