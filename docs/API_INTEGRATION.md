# Wiring in Real Data (SofaScore)

## 1. No signup, no key
`app/providers/sofascore.py` calls SofaScore's public web API — the same
`/api/v1/...` endpoints sofascore.com's own frontend calls. There's no
official SDK or key for this; it just works. Install dependencies (adds
`curl_cffi`, needed to get past SofaScore's Cloudflare bot-check — see below)
and start the backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
A sync runs automatically a few seconds after startup, and again every day
at 04:00 UTC. `GET /api/health` reports `"mode": "live-data"` once at least
one league has synced successfully.

## 2. Which leagues are real right now
| Our league id     | League                | SofaScore tournament id |
|--------------------|-----------------------|--------------------------|
| premier-league     | Premier League (ENG)  | 17  |
| la-liga            | La Liga (ESP)          | 8   |
| serie-a            | Serie A (ITA)          | 23  |
| bundesliga         | Bundesliga (GER)       | 35  |
| ligue-1            | Ligue 1 (FRA)          | 34  |
| brasileirao        | Brasileirão (BRA)      | 325 |
| saudi-pro-league   | Saudi Pro League (SAU) | 955 |
| eredivisie         | Eredivisie (NED)       | 37  |
| primeira-liga      | Primeira Liga (POR)    | 238 |
| super-lig          | Süper Lig (TUR)        | 52  |

Everything else in `mock_data.py` (Championship, MLS, Russian Premier League,
Belgium, Argentina, Egypt, Morocco, Algeria, Tunisia, Qatar, UAE, Japan,
South Korea, China, India, ...) stays on the generated mock layer for now —
**not** because SofaScore doesn't cover them (it covers nearly everything),
just because those tournament ids haven't been looked up and verified yet.

### Adding a league
1. Open the league on sofascore.com, e.g. `sofascore.com/tournament/football/england/premier-league/17`
   — the trailing number is the tournament id.
2. Alternatively, open DevTools → Network tab while browsing the league page
   and look for a request to `/api/v1/unique-tournament/<id>/...`.
3. Add `"your-league-id": <id>` to `LEAGUE_ID_TO_SOFASCORE_ID` in
   `app/providers/sofascore.py`. It'll be picked up by the next sync — no
   other code changes needed, since `sync.py` just iterates that dict.

## 3. What's real vs. computed
SofaScore gives real teams, standings, and match results/fixtures. It does
**not** give win-probability predictions — no free data source does. Those
are still computed by `app/prediction_model.py`, a small transparent
statistical model (points-per-game + goal difference + home advantage →
logistic curve), not fetched from anywhere. Documented in that file's
docstring, unchanged from before.

## 4. How syncing works
- **Manual**: Admin dashboard → Overview → "Trigger Manual Sync", or
  `POST /api/admin/sync`. Check `GET /api/admin/logs` for the result.
- **Automatic**: `main.py` runs one sync a few seconds after the app starts,
  then schedules `daily_sync_job()` via APScheduler at 04:00 UTC daily.
- Each sync does, per mapped league: 1 call for seasons, 1 call for
  standings — then, once, 3 calls total (not per league) for
  yesterday/today/tomorrow's full worldwide fixture list, filtered down to
  the mapped leagues. A small delay is added between requests
  (`SofaScoreClient(request_delay=...)`, default 1.2s) to stay polite.
- Sync updates teams, standings, and matches for each mapped league in
  place. Unmapped leagues are never touched. A league that fails partway
  (e.g. a malformed standings row) is skipped for that run and logged in
  `failed_leagues` — it keeps whatever data it had before.

## 5. Untested against the live API
I don't have network access to sofascore.com from where this was built, so
`app/providers/sofascore.py` and `app/sync.py` are built against SofaScore's
API shape as documented in public reference projects (particularly
[tunjayoff/sofascore_scraper](https://github.com/tunjayoff/sofascore_scraper),
which this was adapted from) and defensively coded — every field access uses
`.get()` with fallbacks, and a parsing failure on one league is caught and
logged rather than crashing the sync — but the real success path (a live
call actually returning the expected JSON shape) hasn't been exercised here.

Run `POST /api/admin/sync` locally and check `GET /api/admin/logs`. If a
league shows up in `failed_leagues`, or the response shape doesn't quite
match what the code expects:
1. Open sofascore.com in a browser, go to the league's Standings tab, open
   DevTools → Network, and find the matching `/api/v1/...` request.
2. Compare the real JSON keys against what `extract_standings_rows`,
   `row_played`, `row_scores_for`, `row_scores_against` in
   `providers/sofascore.py` expect — SofaScore isn't a documented API, so
   field names can differ slightly by tournament or have changed since this
   was written.
3. If you get `403 (Cloudflare challenge)` errors, SofaScore has likely
   changed its bot-check — check that `curl_cffi`'s impersonation profiles
   in `IMPERSONATE_PROFILES` are still current (newer Chrome versions get
   added to curl_cffi over time; `pip install -U curl_cffi` and try a newer
   profile name if the current ones stop working).

## 6. Being a good citizen
This hits `sofascore.com` directly rather than a documented, rate-limited
API, so: keep the request delay in place, don't run sync more often than
the daily cron + occasional manual triggers, and don't scale this up to
hammer every league every minute. If SofaScore starts blocking requests
consistently, that's a sign to slow down further, not to add more
impersonation tricks.
