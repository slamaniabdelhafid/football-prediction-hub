# Design System — "Floodlit Pitch"

## Color (dark, default)
- `--bg`: #0B1220 (near-black navy — night sky over a stadium)
- `--surface`: #121B2E (card background)
- `--surface-2`: #1A2740 (elevated card / hover)
- `--turf`: #1FAE6B (primary accent — pitch green, used for "Home Win" / positive)
- `--amber`: #F5A623 (scoreboard amber — confidence, "Draw", highlights)
- `--red`: #E5484D ("Away Win" / negative / live)
- `--line`: #24304A (hairline borders, like pitch markings)
- `--text`: #EDF1F7
- `--text-dim`: #8B97AC

## Color (light mode)
- `--bg`: #F6F7FA
- `--surface`: #FFFFFF
- `--surface-2`: #EEF1F6
- `--line`: #DCE1EA
- `--text`: #101826
- `--text-dim`: #5B6576
(accents stay the same — turf/amber/red)

## Type
- Display / scores / big numbers: **Barlow Condensed**, bold — scoreboard energy, tall & narrow
- Body / UI: **Inter** — neutral, highly legible at small sizes for dense stat tables
- Data / stats / mono figures: **IBM Plex Mono** — used for percentages, times, odds-style numbers

## Layout
- Card grid, 12px-16px radius, hairline borders (not heavy shadows) — pitch-marking feel
- Match card signature element: the prediction bar is a single horizontal **three-segment bar**
  (Home / Draw / Away) styled like a stadium scoreboard segment display, with the confidence
  number rendered in amber mono type above it — this is the one recurring motif across the site
- Sticky top nav with a thin turf-green underline on the active section (like a pitch touchline)

## Motion
- Prediction bars animate their width in on mount (ease-out, ~600ms)
- Match status dot pulses only when a match is LIVE
- No scroll-jacking, no gratuitous parallax — motion is functional, tied to live/updating data
