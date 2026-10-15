# F1 Race Hub — 2026 Season

A Formula 1 fan dashboard for the 2026 season: drivers, teams, an unofficial standings table, the race calendar with a live countdown, an interactive circuit map, favourites and a fan sign-up widget.

## Running it

The site loads its data with `fetch()` and uses JavaScript modules, so it must be served over HTTP — opening `index.html` directly from disk (`file://`) won't work.

- **VS Code:** install the *Live Server* extension, right-click `index.html` → *Open with Live Server*.
- **Python:** `python3 -m http.server 8000` in this folder, then open http://localhost:8000.
- **GitHub Pages:** works as-is.

## Project structure

```
index.html
data/
  data.json            drivers, teams, races, circuits
css/
  base.css             colours, reset, typography, buttons
  layout.css           header, nav, sections, stat strip, footer
  cards.css            driver / team / race cards
  components/          one file per feature (search, compare, standings,
                       favourites, countdown, map, featured, join-fans)
js/
  main.js              entry point: loads data, starts every feature
  state.js             shared data + team colours
  utils.js             escapeHtml, scoring, safe localStorage helpers
  render/              drivers, teams, races, standings, stats
  features/            featured, favourites, search, compare,
                       countdown, map, join-fans
docs/
  capstone-plan.md
```

To update the season, edit `data/data.json` — the stat strip, team dropdown and map popups all read from it.
