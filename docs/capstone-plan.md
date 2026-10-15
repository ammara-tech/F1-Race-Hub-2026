# My Capstone Plan — <Ammara Badat>

> Fill in each section. Save this file. Bring it to tomorrow's build session.

## 1. The idea (one sentence)

> What does the app do, and for whom? Be concrete.
> _Example: "A petrol-price tracker for SA cities — shows current 95-octane price per city, lets the user filter by province."_

**My idea:**
A Formula 1 dashboard web app that displays drivers, teams, race calendar, and circuit locations, while allowing users to search drivers, save favourites, compare drivers, and track performance stats.


## 2. The data source

- **URL or filename:**data.json
- **Source type:** local data.json I'll author
- **Key required?** NO
- **Sample fetch you've run in DevTools console:** _paste a one-line snippet that worked_

```javascript
const r = await fetch('data.json');
const data = await r.json();
console.log(data.drivers[0]);

```

## 3. The record shape (one record only)

_Fill in the field names + types of ONE record in the dataset. Every function below depends on this._

record = {
  id: number,
  name: string,
  team: string,
  nationality: string,
  wins: number,
  worldChampionships: number,
  championshipYears: array,
  description: string,
}


## 4. The function list (verbs + objects, not vague words)

| Function                 | What it does                                   | Tier   |
| ------------------------ | ---------------------------------------------- | ------ |
| `fetchData()`            | loads JSON data and initializes app            | Floor  |
| `renderDrivers(items)`   | renders driver cards to DOM                    | Floor  |
| `renderTeams(items)`     | renders team cards                             | Floor  |
| `renderRaces(items)`     | renders race schedule                          | Floor  |
| `renderStandings()`      | calculates + displays championship leaderboard | Tier 1 |
| `compareDrivers()`       | compares two drivers statistically             | Tier 1 |
| `saveFavourite(driver)`  | saves driver to favourites (localStorage)      | Tier 1 |
| `renderFavourites()`     | displays all saved favourite drivers           | Tier 1 |
| `updateFavouriteStats()` | calculates totals (wins, titles, count)        | Tier 2 |
| `showMap()`              | renders circuits using Leaflet map             | Tier 2 |
| `startCountdown()`       | live countdown to next race                    | Tier 2 |


> Floor MUST include fetch + render. Add a function per tier you target. Use verbs + objects (`drawChart(items)`, not "show chart"; `saveFavourites(ids)`, not "save").



## 5. The wireframe — sketch + ids

> Sketch on paper, photograph, or describe in text. NAME the HTML ids your JS will select. Mark which tier each element belongs to.

[ Header: F1 Race Hub 2026 ]

[#searchInput]                  (Tier 1: search/filter)
[#driversContainer]            (Floor: driver cards)
[#teamsContainer]              (Floor: team cards)
[#racesContainer]              (Floor: race calendar)

[#featuredDriverCard]          (Tier 2: dynamic highlight)

[#favouriteDriver]             (Tier 1: saved favourites list)
[#removeFavouriteBtn]          (Tier 1: delete action)

[#compareSection]
  - #driverA
  - #driverB
  - #compareResult             (Tier 1: comparison tool)

[#standingsContainer]          (Tier 1: leaderboard)

[#favStats]                    (Tier 2: analytics panel)

[#map]                         (Tier 2: circuit map)

[#countdown]                   (Tier 2: live timer)

[#statusText]                  (Tier 3: optional debugging/status)


## 6. Tier target

  Floor — fetch + render drivers, teams, races ✔
 Tier 1 — search, favourites, compare, standings ✔
 Tier 2 — map, countdown, stats panel ✔
 Tier 3 — persistence polish + advanced UX (optional next step)



## Self-check before Thursday

 My data source is real and key-free (local JSON tested via fetch)
 The record shape matches actual dataset
 Function names are verbs + objects (fetchData, renderDrivers, etc.)
 Floor is fetch + render only
 Wireframe IDs exist in HTML and JS

 I can explain my Floor:

“The app fetches F1 driver data from a local JSON file and renders it into interactive cards for users to explore.”