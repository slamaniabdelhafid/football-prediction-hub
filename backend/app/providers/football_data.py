"""
Client for https://api.football-data.org/v4 (free tier).

Free tier covers exactly these competition codes (this "remains free forever"
per football-data.org's own policy): PL, ELC, PD, SA, BL1, FL1, DED, PPL,
BSA, CL, EC, WC. Rate limit: 10 requests/minute.

Sign up: https://www.football-data.org/client/register
"""
import os
import httpx
from datetime import datetime
from typing import Optional

BASE_URL = "https://api.football-data.org/v4"

# Maps OUR league ids (see backend/app/mock_data.py) -> football-data.org competition codes.
# Only leagues in this dict get replaced with real data; everything else stays on
# the generated mock data layer. This is the free tier's actual competition list.
LEAGUE_ID_TO_FD_CODE = {
    "premier-league": "PL",
    "championship": "ELC",
    "la-liga": "PD",
    "serie-a": "SA",
    "bundesliga": "BL1",
    "ligue-1": "FL1",
    "eredivisie": "DED",
    "primeira-liga": "PPL",
    "brasileirao": "BSA",
    # CL (Champions League), EC (Euros), WC (World Cup) are cup competitions,
    # not leagues with standings tables in our sense — left out of the mapping
    # on purpose; add a "cup" league type in a future stage if you want them.
}


class FootballDataClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("FOOTBALL_DATA_API_KEY")
        if not self.api_key:
            raise RuntimeError(
                "FOOTBALL_DATA_API_KEY not set. Get a free key at "
                "https://www.football-data.org/client/register and put it in backend/.env"
            )
        self._client = httpx.Client(
            base_url=BASE_URL,
            headers={"X-Auth-Token": self.api_key},
            timeout=15.0,
        )

    def close(self):
        self._client.close()

    def get_competition(self, code: str) -> dict:
        r = self._client.get(f"/competitions/{code}")
        r.raise_for_status()
        return r.json()

    def get_standings(self, code: str) -> dict:
        r = self._client.get(f"/competitions/{code}/standings")
        r.raise_for_status()
        return r.json()

    def get_matches(self, code: str, date_from: Optional[str] = None, date_to: Optional[str] = None) -> dict:
        params = {}
        if date_from:
            params["dateFrom"] = date_from
        if date_to:
            params["dateTo"] = date_to
        r = self._client.get(f"/competitions/{code}/matches", params=params)
        r.raise_for_status()
        return r.json()


# ---------------------------------------------------------------------------
# Transformers: football-data.org JSON -> our Pydantic models
# ---------------------------------------------------------------------------
_STATUS_MAP = {
    "SCHEDULED": "scheduled", "TIMED": "scheduled",
    "IN_PLAY": "live", "PAUSED": "live",
    "FINISHED": "finished", "AWARDED": "finished",
    "POSTPONED": "scheduled", "SUSPENDED": "scheduled", "CANCELLED": "scheduled",
}


def fd_status_to_ours(fd_status: str) -> str:
    return _STATUS_MAP.get(fd_status, "scheduled")


def parse_fd_datetime(utc_date: str) -> datetime:
    # football-data.org returns e.g. "2026-07-11T15:00:00Z"
    return datetime.fromisoformat(utc_date.replace("Z", "+00:00"))
