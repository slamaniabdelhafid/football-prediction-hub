"""
Sync: for every league we have a football-data.org competition-code mapping
for, replace that league's mock teams/standings/matches with real data.
Leagues with no mapping stay on the generated mock layer, untouched.

Uses api.football-data.org (see app/providers/football_data.py) — a
documented, key-authenticated API, not SofaScore's undocumented one. This
project tried SofaScore first (see git history / app/providers/sofascore.py)
but its Cloudflare bot-check reliably 403's requests from server hosts like
Render, which isn't something worth building around for a production sync
job. football-data.org's free tier is smaller (9 leagues with standings
tables on our side, out of its 12 total competitions) but it's a real,
stable, documented API — no key, no data.

Needs FOOTBALL_DATA_API_KEY set (free, no card:
https://www.football-data.org/client/register). If it's not set, run_sync()
raises immediately and every league stays on mock data — see main.py /
admin.py, which both catch that and log it clearly rather than crash.

Rate limit: 10 requests/minute on the free tier. Two calls per mapped league
(standings + matches) -> ~18 calls for all 9 leagues, spaced out below to
stay under the limit rather than trying to burst and hit 429s. A module-level
lock (SYNC_LOCK below) also prevents two syncs running at once — e.g. the
startup sync and a manual admin trigger overlapping — which would double the
request rate and blow through the limit even with the spacing in place.
"""
import threading
import time
from datetime import datetime, timedelta, timezone

from . import mock_data as md
from .models import Team, StandingRow, Match, MatchStatus
from .prediction_model import estimate_prediction
from .providers.football_data import (
    FootballDataClient, LEAGUE_ID_TO_FD_CODE, fd_status_to_ours, parse_fd_datetime,
)

REQUEST_DELAY_SECONDS = 7.0  # keeps us under 10 req/min with margin
SYNC_LOCK = threading.Lock()


def _team_id(league_id: str, name: str) -> str:
    return f"{league_id}__{md._slug(name)}"


def _sync_standings_for_league(client: FootballDataClient, league_id: str, code: str) -> dict[int, dict] | None:
    """
    Rebuilds teams + standings for one league from football-data.org. Returns
    a map of {fd_team_id: stats_dict} for the matches phase, or None if this
    league couldn't be synced (left on mock data untouched).
    """
    data = client.get_standings(code)
    time.sleep(REQUEST_DELAY_SECONDS)

    total_table = next((s.get("table", []) for s in data.get("standings", []) if s.get("type") == "TOTAL"), [])
    if not total_table:
        return None

    new_teams: list[Team] = []
    new_rows: list[StandingRow] = []
    stats_by_fd_team_id: dict[int, dict] = {}

    for row in total_table:
        fd_team = row.get("team") or {}
        fd_team_id = fd_team.get("id")
        name = fd_team.get("name")
        if not fd_team_id or not name:
            continue

        tid = _team_id(league_id, name)
        team = Team(
            id=tid, name=name,
            short_name=(fd_team.get("tla") or name[:3]).upper(),
            logo=fd_team.get("crest") or "",
            league_id=league_id,
        )
        new_teams.append(team)

        played = row.get("playedGames", 0) or 0
        gf = row.get("goalsFor", 0) or 0
        ga = row.get("goalsAgainst", 0) or 0
        points = row.get("points", 0) or 0

        new_rows.append(StandingRow(
            position=row.get("position", 0) or 0, team=team, played=played,
            wins=row.get("won", 0) or 0, draws=row.get("draw", 0) or 0, losses=row.get("lost", 0) or 0,
            goals_for=gf, goals_against=ga, goal_diff=row.get("goalDifference", gf - ga),
            points=points, form=[],
        ))
        stats_by_fd_team_id[fd_team_id] = {
            "team_id": tid, "points": points, "played": max(played, 1),
            "goal_diff": gf - ga,
            "avg_scored": gf / max(played, 1), "avg_conceded": ga / max(played, 1),
            "form": None,
        }

    if not new_teams:
        return None

    md.TEAMS_BY_LEAGUE[league_id] = new_teams
    for t in new_teams:
        md.TEAMS[t.id] = t
    new_rows.sort(key=lambda r: r.position or 999)
    md.STANDINGS[league_id] = new_rows
    md.LEAGUES[league_id].data_source = "live"

    return stats_by_fd_team_id


def _sync_matches_for_league(
    client: FootballDataClient, league_id: str, code: str, team_stats: dict[int, dict]
) -> int:
    """Pulls yesterday/today/tomorrow's matches for one competition. One API call."""
    now = datetime.now(timezone.utc)
    date_from = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    date_to = (now + timedelta(days=1)).strftime("%Y-%m-%d")

    data = client.get_matches(code, date_from=date_from, date_to=date_to)
    time.sleep(REQUEST_DELAY_SECONDS)

    for mid in [m for m, match in md.MATCHES.items() if match.league_id == league_id]:
        del md.MATCHES[mid]

    written = 0
    for ev in data.get("matches", []):
        home_fd = (ev.get("homeTeam") or {}).get("id")
        away_fd = (ev.get("awayTeam") or {}).get("id")
        home_stats = team_stats.get(home_fd)
        away_stats = team_stats.get(away_fd)
        if not home_stats or not away_stats:
            continue  # e.g. a cup fixture team not in this league's table

        home_team = md.TEAMS.get(home_stats["team_id"])
        away_team = md.TEAMS.get(away_stats["team_id"])
        if not home_team or not away_team:
            continue

        score = (ev.get("score") or {}).get("fullTime") or {}
        home_score, away_score = score.get("home"), score.get("away")
        status_kind = fd_status_to_ours(ev.get("status", "SCHEDULED"))
        status = MatchStatus(kind=status_kind, home_score=home_score, away_score=away_score, minute=None)

        prediction = estimate_prediction(
            home_stats["points"], home_stats["played"], home_stats["goal_diff"],
            home_stats["avg_scored"], home_stats["avg_conceded"],
            away_stats["points"], away_stats["played"], away_stats["goal_diff"],
            away_stats["avg_scored"], away_stats["avg_conceded"],
            home_form=home_stats.get("form"), away_form=away_stats.get("form"),
        )

        correct = None
        if status.kind == "finished" and home_score is not None and away_score is not None:
            actual = "home" if home_score > away_score else ("away" if away_score > home_score else "draw")
            correct = (actual == prediction.predicted_winner)

        utc_date = ev.get("utcDate")
        if not utc_date:
            continue

        mid = f"fd__{league_id}__{ev.get('id')}"
        md.MATCHES[mid] = Match(
            id=mid, league_id=league_id, home_team=home_team, away_team=away_team,
            kickoff=parse_fd_datetime(utc_date), stadium=(ev.get("venue") or None),
            status=status, prediction=prediction, featured=False, prediction_correct=correct,
        )
        written += 1

    return written


def run_sync(only_league_ids: list[str] | None = None) -> dict:
    """
    Pulls real data for every mapped league (or a subset). Returns a summary
    dict for the admin sync log. A failure on one league is caught and
    logged; leagues that already synced keep their data, unsynced ones stay
    on mock data. Raises immediately (uncaught) only if FOOTBALL_DATA_API_KEY
    is missing entirely — callers (admin.py, main.py) catch that.

    If a sync is already running (e.g. the startup job hasn't finished and
    someone hits "Trigger Manual Sync"), this returns immediately instead of
    running a second overlapping sync — two at once would double the request
    rate and blow through the 10/min free-tier limit.
    """
    if not SYNC_LOCK.acquire(blocking=False):
        return {
            "synced_leagues": [], "failed_leagues": [],
            "matches_synced": 0, "timestamp": datetime.now(timezone.utc).isoformat(),
            "skipped": "A sync is already in progress — wait for it to finish before retrying.",
        }

    try:
        targets = {
            lid: code for lid, code in LEAGUE_ID_TO_FD_CODE.items()
            if only_league_ids is None or lid in only_league_ids
        }

        client = FootballDataClient()  # raises RuntimeError here if no API key set
        synced, failed, matches_written = [], [], 0

        try:
            for league_id, code in targets.items():
                try:
                    stats = _sync_standings_for_league(client, league_id, code)
                    if not stats:
                        failed.append({"league_id": league_id, "error": "No standings data returned"})
                        continue
                    matches_written += _sync_matches_for_league(client, league_id, code, stats)
                    synced.append(league_id)
                except Exception as e:
                    failed.append({"league_id": league_id, "error": str(e)})
        finally:
            client.close()

        _refresh_featured_matches()

        return {
            "synced_leagues": synced,
            "failed_leagues": failed,
            "matches_synced": matches_written,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    finally:
        SYNC_LOCK.release()


def _refresh_featured_matches(top_n: int = 4) -> None:
    """
    sync.py never sets featured=True on individual matches while syncing
    each league (no per-match signal for it in football-data.org's data),
    so without this the home page's Featured Matches section would just stay
    permanently empty once real data replaces mock data. Instead, after each
    full sync, mark the N highest-confidence upcoming real matches across all
    synced leagues as featured — real matches only, never mock/simulated ones.
    """
    for m in md.MATCHES.values():
        m.featured = False

    live_league_ids = {lid for lid, l in md.LEAGUES.items() if l.data_source == "live"}
    upcoming_live = [
        m for m in md.MATCHES.values()
        if m.league_id in live_league_ids and m.status.kind == "scheduled"
    ]
    upcoming_live.sort(key=lambda m: m.prediction.confidence_pct, reverse=True)
    for m in upcoming_live[:top_n]:
        m.featured = True
