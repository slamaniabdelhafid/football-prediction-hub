"""
Sync: for every league we have a SofaScore tournament-id mapping for, replace
that league's mock teams/standings/matches with real data pulled from
SofaScore's public API. Leagues with no mapping stay on the generated mock
layer, untouched.

Two-phase, to keep request count low:
  1. Standings phase — one or two calls per mapped league (seasons, then
     standings) to rebuild real teams + table + the per-team stats the
     prediction model needs.
  2. Matches phase — three calls TOTAL (yesterday/today/tomorrow), each
     returning every football match worldwide that day; we filter those down
     to our mapped leagues instead of hitting the API once per league.

No API key required — this is the same public API sofascore.com's own
frontend calls. See app/providers/sofascore.py for endpoint details and
app/providers/football_data.py for the older, key-based alternative (kept
for reference; no longer used by default).
"""
from datetime import datetime, timedelta, timezone

from . import mock_data as md
from .models import Team, StandingRow, Match, MatchStatus
from .prediction_model import estimate_prediction
from .providers.sofascore import (
    SofaScoreClient, SofaScoreError, LEAGUE_ID_TO_SOFASCORE_ID,
    sofa_status_to_ours, parse_sofa_timestamp,
    extract_standings_rows, row_played, row_scores_for, row_scores_against,
)


def _team_id(league_id: str, name: str) -> str:
    return f"{league_id}__{md._slug(name)}"


def _sync_standings_for_league(
    client: SofaScoreClient, league_id: str, tournament_id: int
) -> dict[int, dict] | None:
    """
    Rebuilds teams + standings for one league from SofaScore. Returns a map of
    {sofascore_team_id: stats_dict} for use in the matches phase, or None if
    this league couldn't be synced (left on mock data untouched).
    """
    season_id = client.get_latest_season_id(tournament_id)
    if season_id is None:
        return None

    standings_json = client.get_standings(tournament_id, season_id)
    rows = extract_standings_rows(standings_json)
    if not rows:
        return None

    new_teams: list[Team] = []
    new_rows: list[StandingRow] = []
    stats_by_sofa_team_id: dict[int, dict] = {}

    for row in rows:
        sofa_team = row.get("team") or {}
        sofa_team_id = sofa_team.get("id")
        name = sofa_team.get("name") or sofa_team.get("shortName")
        if not sofa_team_id or not name:
            continue  # malformed row — skip rather than guess

        tid = _team_id(league_id, name)
        team = Team(
            id=tid, name=name,
            short_name=(sofa_team.get("nameCode") or name[:3]).upper(),
            logo=f"https://api.sofascore.app/api/v1/team/{sofa_team_id}/image",
            league_id=league_id,
        )
        new_teams.append(team)

        played = row_played(row)
        gf = row_scores_for(row)
        ga = row_scores_against(row)
        wins = row.get("wins", 0) or 0
        draws = row.get("draws", 0) or 0
        losses = row.get("losses", 0) or 0
        points = row.get("points", wins * 3 + draws) or 0

        new_rows.append(StandingRow(
            position=row.get("position", 0) or 0, team=team, played=played,
            wins=wins, draws=draws, losses=losses,
            goals_for=gf, goals_against=ga, goal_diff=gf - ga,
            points=points, form=[],  # SofaScore's total-standings row has no last-5 form field
        ))
        stats_by_sofa_team_id[sofa_team_id] = {
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

    return stats_by_sofa_team_id


def _sync_matches_from_daily_events(
    client: SofaScoreClient,
    stats_by_league: dict[str, dict[int, dict]],
    sofa_id_to_league_id: dict[int, str],
) -> int:
    """
    Pulls yesterday/today/tomorrow's full worldwide event list (3 calls) and
    builds Match objects only for events belonging to leagues we successfully
    synced standings for. Returns the number of matches written.
    """
    now = datetime.now(timezone.utc)
    dates = [(now + timedelta(days=d)).strftime("%Y-%m-%d") for d in (-1, 0, 1)]

    all_events: list[dict] = []
    for date_str in dates:
        data = client.get_scheduled_events(date_str)
        all_events.extend(data.get("events", []))

    # Drop old mock/live matches for every league we're about to replace
    synced_league_ids = set(stats_by_league.keys())
    for mid in [m for m, match in md.MATCHES.items() if match.league_id in synced_league_ids]:
        del md.MATCHES[mid]

    written = 0
    for ev in all_events:
        tournament = (ev.get("tournament") or {}).get("uniqueTournament") or {}
        sofa_tid = tournament.get("id")
        league_id = sofa_id_to_league_id.get(sofa_tid)
        if league_id is None or league_id not in stats_by_league:
            continue  # not one of our mapped leagues

        team_stats = stats_by_league[league_id]
        home_sofa = (ev.get("homeTeam") or {}).get("id")
        away_sofa = (ev.get("awayTeam") or {}).get("id")
        home_stats = team_stats.get(home_sofa)
        away_stats = team_stats.get(away_sofa)
        if not home_stats or not away_stats:
            continue  # e.g. cup fixture between teams outside the league table — skip rather than guess

        home_team = md.TEAMS.get(home_stats["team_id"])
        away_team = md.TEAMS.get(away_stats["team_id"])
        if not home_team or not away_team:
            continue

        home_score = (ev.get("homeScore") or {}).get("current")
        away_score = (ev.get("awayScore") or {}).get("current")
        status_type = (ev.get("status") or {}).get("type", "notstarted")
        status = MatchStatus(
            kind=sofa_status_to_ours(status_type),
            home_score=home_score, away_score=away_score,
            minute=(ev.get("status") or {}).get("minute") if sofa_status_to_ours(status_type) == "live" else None,
        )

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

        start_ts = ev.get("startTimestamp")
        if not start_ts:
            continue
        venue = ((ev.get("venue") or {}).get("stadium") or {}).get("name") or (ev.get("venue") or {}).get("name")

        mid = f"sofa__{league_id}__{ev.get('id')}"
        md.MATCHES[mid] = Match(
            id=mid, league_id=league_id, home_team=home_team, away_team=away_team,
            kickoff=parse_sofa_timestamp(start_ts), stadium=venue,
            status=status, prediction=prediction, featured=False, prediction_correct=correct,
        )
        written += 1

    return written


def run_sync(only_league_ids: list[str] | None = None) -> dict:
    """
    Pulls real data for every mapped league (or a subset of it). Returns a
    summary dict for the admin sync log. Safe to call at any time — a failure
    on one league is caught and logged; leagues that already synced keep
    their real data, and unsynced ones simply stay on mock data.
    """
    targets = {
        lid: tid for lid, tid in LEAGUE_ID_TO_SOFASCORE_ID.items()
        if only_league_ids is None or lid in only_league_ids
    }
    sofa_id_to_league_id = {tid: lid for lid, tid in targets.items()}

    client = SofaScoreClient()
    synced, failed = [], []
    stats_by_league: dict[str, dict[int, dict]] = {}
    matches_written = 0

    try:
        for league_id, tournament_id in targets.items():
            try:
                stats = _sync_standings_for_league(client, league_id, tournament_id)
                if stats:
                    stats_by_league[league_id] = stats
                    synced.append(league_id)
                else:
                    failed.append({"league_id": league_id, "error": "No standings data returned"})
            except SofaScoreError as e:
                failed.append({"league_id": league_id, "error": str(e)})

        if stats_by_league:
            try:
                matches_written = _sync_matches_from_daily_events(
                    client, stats_by_league, sofa_id_to_league_id,
                )
            except SofaScoreError as e:
                failed.append({"league_id": "*matches*", "error": str(e)})
    finally:
        client.close()

    return {
        "synced_leagues": synced,
        "failed_leagues": failed,
        "matches_synced": matches_written,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
