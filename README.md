# F1 Race Hub — 2026 Season

A Formula 1 fan site for the 2026 season with live standings and results, driver and team profiles, the race calendar, a podium prediction game, an interactive circuit map, and a Gallery & History page.

## Features

- **Live data**: official driver and constructor standings, race results, podiums and start times from the free [Jolpica F1 API](https://github.com/jolpica/jolpica-f1). Data is cached for 15 minutes. If the API is down, the site falls back to the last copy it fetched, then to `data/data.json`.
- **Last race result** with a podium and P4–P10.
- **Driver profiles**: click any driver to see their stats and a round-by-round points chart compared with their teammate.
- **Race calendar** filtered by upcoming, completed or sprint races. Start times show in your own time zone, and races can be added to Apple, Google or Outlook calendars (`.ics`).
- **Podium Predictor**: pick the top three before each race. Scores are worked out automatically from the results.
- **Search and sort** drivers, save favourites, compare drivers head to head.
- **Light/dark mode** toggle, remembered per browser.
- **Circuit map** whose popups show a photo of each venue.
- **Team logos** on the team cards; car photos appear in the gallery's Cars section.
- **Gallery & History** (`gallery.html`): photos of every driver, car and circuit, team logos, a timeline of F1 from 1950 to 2026, and photo credits.

## Running it

The site uses `fetch()` and JavaScript modules, so it must be served over HTTP. Opening `index.html` straight from disk (`file://`) won't work.

- **VS Code:** install *Live Server*, right-click `index.html` → *Open with Live Server*.
- **Python:** `python3 -m http.server 8000`, then open http://localhost:8000.
- **GitHub Pages:** works as-is.

## Photos

All photos are stored in `images/`, so they always load. They come from **Wikimedia Commons** and are freely licensed. Each photo's author and licence is listed on the Gallery page (required by the licences).

- `data/image-sources.json` sets where each picture comes from (a Wikipedia article, a Commons search, or an exact Commons file name).
- `scripts/download-images.mjs` downloads them and writes `data/image-credits.json`.
- The **Download images** GitHub Action runs the script automatically whenever `image-sources.json` changes. You can also run it from the *Actions* tab and tick *force* to refresh everything.

**Team logos** live in `images/logos/`. Wikimedia has no freely licensed logo for Ferrari or Racing Bulls, so those two show the team name in team colours. To use your own logo file, add it (e.g. `images/logos/ferrari.svg`) and put `{ "local": "images/logos/ferrari.svg" }` first in that team's sources in `data/image-sources.json`, then push.

To swap a photo, find one you like on [commons.wikimedia.org](https://commons.wikimedia.org) and put its file name first in that item's sources, e.g. `{ "file": "Lewis Hamilton 2026.jpg" }`. Then push and the Action fetches it. To run the script locally: `node scripts/download-images.mjs` (Node 18+).

## Project structure

```
index.html             home page
gallery.html           gallery & history page
data/
  data.json            drivers, teams, races, circuits (fallback data)
  history.json         F1 history timeline
  image-sources.json   where each photo comes from
  image-credits.json   generated: photo paths, authors, licences
images/                generated: drivers, logos, cars, circuits, history
css/
  base.css             theme colours (dark + light), reset, buttons, chips
  layout.css           header, nav, sections, footer
  cards.css            driver / team / race cards, photo placeholders
  components/          one file per feature
js/
  main.js              home page entry point
  gallery-main.js      gallery page entry point
  state.js             shared data
  utils.js             helpers (escaping, dates, storage)
  images.js            local photo lookup + placeholders
  api/                 jolpica.js (fetch + cache), live.js (merge into state)
  render/              drivers, teams, races, standings, results, gallery, history…
  features/            modal, predictions, calendar export, theme, map, search/sort…
scripts/
  download-images.mjs
docs/
  capstone-plan.md
```
