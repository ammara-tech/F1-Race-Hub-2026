// =====================================
// DOM ELEMENTS (MATCH YOUR HTML EXACTLY)
// =====================================

const driversContainer = document.getElementById("driversContainer");
const teamsContainer = document.getElementById("teamsContainer");
const racesContainer = document.getElementById("racesContainer");
const favouriteDriver = document.getElementById("favouriteDriver");
const searchInput = document.getElementById("searchInput");
const featuredDriverCard = document.getElementById("featuredDriverCard");
const countdown = document.getElementById("countdown");

let drivers = [];
let teams = [];
let races = [];
let circuits = [];

// =====================================
// FETCH DATA (FIXED + DEBUG MODE)
// =====================================

async function fetchData() {
  try {
    console.log("📦 Attempting to load data.json...");

    const response = await fetch("./data.json");

    console.log("HTTP Status:", response.status);

    if (!response.ok) {
      throw new Error(`data.json not found (HTTP ${response.status})`);
    }

    const data = await response.json();

    console.log("✅ DATA LOADED SUCCESSFULLY");

    drivers = data.drivers || [];
    teams = data.teams || [];
    races = data.races || [];
    circuits = data.circuits || [];

    renderDrivers(drivers);
    renderTeams(teams);
    renderRaces(races);

    renderFeaturedDriver();
    loadFavourite();
    startCountdown();
    showMap();

  } catch (err) {
    console.error("❌ FETCH ERROR:", err);

    document.body.insertAdjacentHTML(
      "afterbegin",
      `
      <div style="
        background:#e10600;
        color:white;
        padding:15px;
        font-weight:bold;
        text-align:center;
        font-family:Arial;
      ">
        ❌ Failed to load data.json — Check Live Server + file path
      </div>
      `
    );
  }
}
renderDrivers(drivers);
renderTeams(teams);
renderRaces(races);

renderFeaturedDriver();
loadFavourite();
startCountdown();
showMap();

// 🔥 MUST BE LAST (after drivers exist)
setTimeout(() => {
  renderStandings();
}, 100);
// =====================================
// RENDER DRIVERS
// =====================================

function renderDrivers(driverList) {
  driversContainer.innerHTML = "";

  driverList.forEach(driver => {
    driversContainer.innerHTML += `
      <div class="card">
        <div class="driver-icon">🏁</div>

        <h3>${driver.name}</h3>
        <p><strong>Team:</strong> ${driver.team}</p>
        <p><strong>Nationality:</strong> ${driver.nationality}</p>
        <p>🏁 Wins: ${driver.wins}</p>
        <p>🏆 Championships: ${driver.worldChampionships}</p>
        <p>📅 Years: ${
          driver.championshipYears?.length
            ? driver.championshipYears.join(", ")
            : "None"
        }</p>
        <p>${driver.description}</p>

        <button onclick="saveFavourite('${driver.name}')">
          ⭐ Favourite Driver
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
      <div class="card">
        <h3>${team.name}</h3>
        <p><strong>Drivers:</strong> ${team.drivers.join(", ")}</p>
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

  list.forEach(race => {
    racesContainer.innerHTML += `
      <div class="card">
        <h3>${race.name}</h3>
        <p>🌍 ${race.country}</p>
        <p>🏁 ${race.circuit}</p>
        <p>📅 ${race.date}</p>
        <p>⏱ ${race.duration}</p>
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

  featuredDriverCard.innerHTML = `
    <div class="card">
      <h3>${driver.name}</h3>
      <p>${driver.team}</p>
      <p>${driver.description}</p>
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

  // prevent duplicates
  if (!favourites.some(f => f.name === driverName)) {
    favourites.push({
      name: driver.name,
      team: driver.team,
      wins: driver.wins,
      championships: driver.worldChampionships
    });
  }

  localStorage.setItem("favouriteDrivers", JSON.stringify(favourites));

  renderFavourites();
}

function loadFavourite() {
  const saved = localStorage.getItem("favouriteDriver");

  const btn = document.getElementById("removeFavouriteBtn");

  if (saved) {
    favouriteDriver.innerHTML = `⭐ ${saved}`;
    if (btn) btn.style.display = "inline-block";
  } else {
    favouriteDriver.innerHTML = "No favourite driver selected.";
    if (btn) btn.style.display = "none";
  }
}
function removeSingleFavourite(name) {
  let favourites = JSON.parse(localStorage.getItem("favouriteDrivers")) || [];

  favourites = favourites.filter(d => d.name !== name);

  localStorage.setItem("favouriteDrivers", JSON.stringify(favourites));

  renderFavourites();
}
function loadFavourite() {
  renderFavourites();
}
function renderFavourites() {
  const container = document.getElementById("favouriteDriver");
  const favourites = JSON.parse(localStorage.getItem("favouriteDrivers")) || [];

  const btn = document.getElementById("removeFavouriteBtn");

  if (!favourites.length) {
    container.innerHTML = "No favourite drivers selected.";
    if (btn) btn.style.display = "none";
    return;
  }

container.innerHTML = "<h3>⭐ My Favourite Drivers</h3><br>";

  favourites.forEach((d, index) => {
    container.innerHTML += `
      <div class="fav-card">
        <h4>${d.name}</h4>
        <p>🏎 Team: ${d.team}</p>
        <p>🏁 Wins: ${d.wins}</p>
        <p>🏆 Titles: ${d.championships}</p>
        <button onclick="removeSingleFavourite('${d.name}')">
          ❌ Remove
        </button>
      </div>
    `;
  });

  if (btn) btn.style.display = "inline-block";
}
function updateFavouriteStats() {
  const container = document.getElementById("favStats");
  const favourites = JSON.parse(localStorage.getItem("favouriteDrivers")) || [];

  if (!favourites.length) {
    container.innerHTML = "<p>No stats available</p>";
    return;
  }

  let totalWins = 0;
  let totalTitles = 0;

  favourites.forEach(d => {
    totalWins += d.wins;
    totalTitles += d.championships;
  });

  container.innerHTML = `
    <div class="card">
      <h3>⭐ Total Favourite Drivers</h3>
      <p>${favourites.length}</p>
    </div>

    <div class="card">
      <h3>🏁 Total Wins</h3>
      <p>${totalWins}</p>
    </div>

    <div class="card">
      <h3>🏆 Total Championships</h3>
      <p>${totalTitles}</p>
    </div>
  `;
}

// =====================================
// SEARCH
// =====================================

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();

    const filtered = drivers.filter(d =>
      d.name.toLowerCase().includes(value) ||
      d.team.toLowerCase().includes(value)
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

    // Find the next upcoming race
    const nextRace = races.find(race => {
      const raceDate = new Date(race.date + "T00:00:00");
      return raceDate >= now;
    });

    // If there are no races left
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
      <h3>${nextRace.name}: </h3>
      <p>${nextRace.country}</p>
      <p><strong>${nextRace.date}</strong></p>

      <div class="countdown-timer">
        ${days}d ${hours}h ${minutes}m ${seconds}s
      </div>
    `;
  }

  updateCountdown();

  // Update every second
  setInterval(updateCountdown, 1000);
}


// =====================================
// MAP (SAFE)
// =====================================

function showMap() {
  if (!window.L) {
    console.warn("Leaflet not loaded");
    return;
  }

  if (!circuits.length) return;

  const map = L.map("map").setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  circuits.forEach(c => {
  const marker = L.marker([c.lat, c.lng]).addTo(map);

  marker.bindPopup(`
    <b>${c.name}</b><br>
    ${c.country}<br>
    🏁 F1 Circuit
  `);

  marker.on("mouseover", () => {
    marker.openPopup();
  });
});
}

function renderStandings() {
  const container = document.getElementById("standingsContainer");

  console.log("Standings container:", container);
  console.log("Drivers in standings:", drivers.length);

  if (!container) {
    console.error("❌ standingsContainer NOT FOUND in HTML");
    return;
  }

  if (!drivers.length) {
    container.innerHTML = "<p>No driver data loaded</p>";
    return;
  }

  const standings = [...drivers].sort((a, b) => {
    return (b.wins * 5 + b.worldChampionships * 50) -
           (a.wins * 5 + a.worldChampionships * 50);
  });

  container.innerHTML = "<h2>🏆 Championship Standings</h2>";

  standings.forEach((d, i) => {
    const points = (d.wins * 5) + (d.worldChampionships * 50);

    container.innerHTML += `
      <div class="card">
        <h3>#${i + 1} ${d.name}</h3>
        <p>${d.team}</p>
        <p>⭐ ${points} pts</p>
      </div>
    `;
  });
}

function compareDrivers() {
  const aName = document.getElementById("driverA").value.toLowerCase();
  const bName = document.getElementById("driverB").value.toLowerCase();
  const result = document.getElementById("compareResult");

  const a = drivers.find(d => d.name.toLowerCase().includes(aName));
  const b = drivers.find(d => d.name.toLowerCase().includes(bName));

  if (!a || !b) {
    result.innerHTML = `
      <div class="card">
        ❌ Please enter two valid drivers
      </div>
    `;
    return;
  }

  const scoreA = (a.wins * 5) + (a.worldChampionships * 50);
  const scoreB = (b.wins * 5) + (b.worldChampionships * 50);

  const winner = scoreA > scoreB ? a.name : b.name;

  result.innerHTML = `
    <div class="card">
      <h3>🏁 ${a.name} VS ${b.name}</h3>

      <p>${a.name}: ${scoreA} pts</p>
      <p>${b.name}: ${scoreB} pts</p>

      <div class="winner">
        🏆 ${winner} leads the duel
      </div>
    </div>
  `;
}

const facts = [
  "F1 cars can brake from 300km/h to 0 in under 4 seconds.",
  "Pit stops can be completed in under 2 seconds.",
  "Engines reach over 15,000 RPM.",
  "Drivers lose up to 3kg per race in fluid.",
  "Downforce allows F1 cars to drive upside down."
];

function rotateFacts() {
  const el = document.querySelector("#facts .card p");
  if (!el) return;

  setInterval(() => {
    const random = facts[Math.floor(Math.random() * facts.length)];
    el.textContent = random;
  }, 4000);
}

// =====================================
// INIT
// =====================================

fetchData();
rotateFacts();