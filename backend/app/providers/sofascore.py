"""
Client for SofaScore's public web API (https://www.sofascore.com/api/v1).

This is the same API the sofascore.com website itself calls from the browser.
It isn't officially documented or supported by SofaScore, requires no API key,
and covers far more leagues than football-data.org's free tier — but it can
change shape or get rate-limited/blocked without notice, so every call here
is defensive (try/except, .get() everywhere) and `sync.py` skips a league
rather than crashing if something doesn't parse.

Two things this client does differently from a plain `httpx.get(...)`,
both copied from the tunjayoff/sofascore_scraper reference project because
without them SofaScore's Cloudflare challenge returns 403 {"reason":"challenge"}:
  1. TLS/browser fingerprint impersonation via curl_cffi (`impersonate="chrome131"`)
     instead of plain requests/httpx, which have an easily-fingerprinted TLS handshake.
  2. The `X-Requested-With: XMLHttpRequest` + `Referer`/`Origin` headers below.

Endpoints used:
  - GET /unique-tournament/{id}/seasons
        -> {"seasons": [{"id": ..., "year": "25/26", ...}, ...]}   newest first
  - GET /unique-tournament/{id}/season/{seasonId}/standings/total
        -> {"standings": [{"rows": [{"team": {...}, "position": .., "matches": ..,
             "wins": .., "draws": .., "losses": .., "scoresFor": .., "scoresAgainst": ..,
             "points": .., ...}, ...]}]}
  - GET /sport/football/scheduled-events/{YYYY-MM-DD}
        -> {"events": [{"tournament": {"uniqueTournament": {"id": ..}}, "homeTeam": {...},
             "awayTeam": {...}, "homeScore": {"current": ..}, "awayScore": {"current": ..},
             "startTimestamp": <unix seconds>, "status": {"type": "notstarted"|"inprogress"|"finished"},
             "venue": {...}}, ...]}
        One call per date returns EVERY football match worldwide that day, which we
        then filter down to our mapped leagues — much cheaper than one call per league.

If you open sofascore.com in a browser and watch the Network tab, you'll see these
same `/api/v1/...` requests — that's the fastest way to confirm/update the shapes above.
"""
import random
import time
from datetime import datetime, timezone
from typing import Any, Optional

from curl_cffi import requests as cffi_requests

BASE_URL = "https://www.sofascore.com/api/v1"

# curl_cffi ships pinned TLS fingerprints for real browser versions; rotating
# between a few makes requests look like different real users instead of one
# obviously-scripted client hammering the API with an identical fingerprint.
IMPERSONATE_PROFILES = ["chrome131", "chrome124", "chrome120"]

# Our league ids (see backend/app/mock_data.py LEAGUE_DEFS) -> SofaScore
# "unique tournament" IDs. Confirmed against tunjayoff/sofascore_scraper's
# config/leagues.txt. Unlike football-data.org's free tier, SofaScore has
# every league in mock_data.py available — this list is just the ones
# verified so far; see docs/API_INTEGRATION.md for how to add the rest.
LEAGUE_ID_TO_SOFASCORE_ID: dict[str, int] = {
    "premier-league": 17,
    "la-liga": 8,
    "serie-a": 23,
    "bundesliga": 35,
    "ligue-1": 34,
    "brasileirao": 325,
    "saudi-pro-league": 955,
    "eredivisie": 37,
    "primeira-liga": 238,
    "super-lig": 52,
}

_STATUS_MAP = {
    "notstarted": "scheduled",
    "postponed": "scheduled",
    "canceled": "scheduled",
    "cancelled": "scheduled",
    "delayed": "scheduled",
    "inprogress": "live",
    "interrupted": "live",
    "finished": "finished",
    "afterextratime": "finished",
    "afterpenalties": "finished",
}


def sofa_status_to_ours(sofa_status_type: str) -> str:
    return _STATUS_MAP.get((sofa_status_type or "").lower(), "scheduled")


def parse_sofa_timestamp(unix_seconds: int) -> datetime:
    return datetime.fromtimestamp(unix_seconds, tz=timezone.utc)


class SofaScoreError(RuntimeError):
    pass


class SofaScoreClient:
    def __init__(self, timeout: float = 15.0, request_delay: float = 1.2):
        self.timeout = timeout
        self.request_delay = request_delay
        self._session = cffi_requests.Session()

    def close(self):
        try:
            self._session.close()
        except Exception:
            pass

    def _headers(self) -> dict[str, str]:
        return {
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.sofascore.com/",
            "Origin": "https://www.sofascore.com",
            # SofaScore's edge returns 403 {"reason":"challenge"} on API paths
            # without this header — it's how the site's own frontend JS marks
            # its XHR calls as coming from the page rather than a bare script.
            "X-Requested-With": "XMLHttpRequest",
        }

    def _get(self, path: str) -> Optional[dict[str, Any]]:
        impersonate = random.choice(IMPERSONATE_PROFILES)
        try:
            r = self._session.get(
                f"{BASE_URL}{path}",
                headers=self._headers(),
                impersonate=impersonate,
                timeout=self.timeout,
            )
        except Exception as e:
            raise SofaScoreError(f"GET {path} failed: {e}") from e

        if r.status_code == 404:
            return None
        if r.status_code == 403:
            raise SofaScoreError(
                f"GET {path} -> 403 (Cloudflare challenge). SofaScore may have "
                "changed its bot-check; compare against a fresh browser Network tab."
            )
        if r.status_code >= 400:
            raise SofaScoreError(f"GET {path} -> HTTP {r.status_code}")

        try:
            return r.json()
        except Exception as e:
            raise SofaScoreError(f"GET {path} returned non-JSON body: {e}") from e
        finally:
            time.sleep(self.request_delay)

    def get_seasons(self, tournament_id: int) -> list[dict[str, Any]]:
        data = self._get(f"/unique-tournament/{tournament_id}/seasons") or {}
        return data.get("seasons", [])

    def get_latest_season_id(self, tournament_id: int) -> Optional[int]:
        seasons = self.get_seasons(tournament_id)
        return seasons[0]["id"] if seasons else None

    def get_standings(self, tournament_id: int, season_id: int) -> dict[str, Any]:
        return self._get(
            f"/unique-tournament/{tournament_id}/season/{season_id}/standings/total"
        ) or {}

    def get_scheduled_events(self, date: str) -> dict[str, Any]:
        """date must be 'YYYY-MM-DD'. Returns every football match worldwide that day."""
        return self._get(f"/sport/football/scheduled-events/{date}") or {}


# ---------------------------------------------------------------------------
# Transform helpers: SofaScore JSON -> plain dicts sync.py turns into our models
# ---------------------------------------------------------------------------
def extract_standings_rows(standings_json: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Flattens the (occasionally nested) standings groups SofaScore returns for
    the "total" table into a single list of row dicts. Most leagues have one
    group; some (rare edge case) split by round or conference.
    """
    rows: list[dict[str, Any]] = []
    for group in standings_json.get("standings", []):
        rows.extend(group.get("rows", []))
    return rows


def row_played(row: dict[str, Any]) -> int:
    return row.get("matches", row.get("played", 0)) or 0


def row_scores_for(row: dict[str, Any]) -> int:
    return row.get("scoresFor", row.get("goalsFor", 0)) or 0


def row_scores_against(row: dict[str, Any]) -> int:
    return row.get("scoresAgainst", row.get("goalsAgainst", 0)) or 0
