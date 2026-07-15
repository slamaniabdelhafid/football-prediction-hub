"""
Deterministic mock data layer.

This stands in for the real football API (Stage 7 wires in Football-Data.org).
Everything here is generated with a fixed random seed so results are stable
across server restarts, which matters for a demo/dev environment.
"""
import random
from datetime import datetime, timedelta, timezone
from .models import (
    Country, League, Team, StandingRow, Prediction, MatchStatus, Match,
    HeadToHead, TeamStats, MatchDetail,
)

random.seed(42)

# ---------------------------------------------------------------------------
# Countries
# ---------------------------------------------------------------------------
COUNTRIES = {
    "england":  Country(name="England", code="EN", flag_emoji="\U0001F3F4\U000E0067\U000E0062\U000E0065\U000E006E\U000E0067\U000E007F"),
    "spain":    Country(name="Spain", code="ES", flag_emoji="\U0001F1EA\U0001F1F8"),
    "italy":    Country(name="Italy", code="IT", flag_emoji="\U0001F1EE\U0001F1F9"),
    "germany":  Country(name="Germany", code="DE", flag_emoji="\U0001F1E9\U0001F1EA"),
    "france":   Country(name="France", code="FR", flag_emoji="\U0001F1EB\U0001F1F7"),
    "netherlands": Country(name="Netherlands", code="NL", flag_emoji="\U0001F1F3\U0001F1F1"),
    "portugal": Country(name="Portugal", code="PT", flag_emoji="\U0001F1F5\U0001F1F9"),
    "brazil":   Country(name="Brazil", code="BR", flag_emoji="\U0001F1E7\U0001F1F7"),
    "europe":   Country(name="Europe", code="EU", flag_emoji="\U0001F1EA\U0001F1FA"),
}

# ---------------------------------------------------------------------------
# Leagues: (id, name, short, country_key, tier, popular, real_team_names_or_None)
# ---------------------------------------------------------------------------
LEAGUE_DEFS = [
    ("premier-league", "Premier League", "EPL", "england", 1, True, [
        "Manchester City", "Liverpool", "Arsenal", "Manchester United", "Chelsea",
        "Tottenham Hotspur", "Newcastle United", "Aston Villa", "Brighton", "West Ham United",
        "Crystal Palace", "Fulham", "Brentford", "Wolves", "Everton",
        "Nottingham Forest", "Bournemouth", "Leicester City", "Ipswich Town", "Southampton",
    ]),
    ("championship", "Championship", "CHA", "england", 2, False, None),
    ("la-liga", "La Liga", "LL", "spain", 1, True, [
        "Real Madrid", "Barcelona", "Atletico Madrid", "Girona", "Athletic Bilbao",
        "Real Sociedad", "Real Betis", "Villarreal", "Valencia", "Sevilla",
        "Osasuna", "Celta Vigo", "Getafe", "Mallorca", "Rayo Vallecano",
        "Las Palmas", "Alaves", "Cadiz", "Granada", "Almeria",
    ]),
    ("serie-a", "Serie A", "SA", "italy", 1, True, [
        "Inter Milan", "AC Milan", "Juventus", "Napoli", "AS Roma",
        "Lazio", "Atalanta", "Fiorentina", "Bologna", "Torino",
        "Monza", "Genoa", "Lecce", "Sassuolo", "Udinese",
        "Cagliari", "Verona", "Empoli", "Frosinone", "Salernitana",
    ]),
    ("bundesliga", "Bundesliga", "BL1", "germany", 1, True, [
        "Bayern Munich", "Bayer Leverkusen", "RB Leipzig", "Borussia Dortmund", "Union Berlin",
        "Freiburg", "Eintracht Frankfurt", "Wolfsburg", "Mainz 05", "Borussia Monchengladbach",
        "Koln", "Hoffenheim", "Werder Bremen", "Bochum", "Augsburg",
        "Stuttgart", "Heidenheim", "Darmstadt",
    ]),
    ("ligue-1", "Ligue 1", "L1", "france", 1, True, [
        "Paris Saint-Germain", "Monaco", "Marseille", "Lille", "Lyon",
        "Lens", "Rennes", "Nice", "Reims", "Toulouse",
        "Montpellier", "Strasbourg", "Nantes", "Le Havre", "Metz",
        "Clermont", "Lorient", "Brest",
    ]),
    ("eredivisie", "Eredivisie", "ERE", "netherlands", 1, True, [
        "Ajax", "PSV Eindhoven", "Feyenoord", "AZ Alkmaar", "FC Twente",
        "FC Utrecht", "Sparta Rotterdam", "NEC Nijmegen",
    ]),
    ("primeira-liga", "Primeira Liga", "PT1", "portugal", 1, True, [
        "Benfica", "Porto", "Sporting CP", "Braga", "Vitoria Guimaraes",
    ]),
    ("brasileirao", "Brasileirao Serie A", "BSA", "brazil", 1, True, [
        "Flamengo", "Palmeiras", "Sao Paulo", "Corinthians", "Fluminense",
        "Botafogo", "Gremio", "Internacional",
    ]),
    # Champions League: since UEFA's 2024/25 reformat, the league phase has a
    # real single-table standings (not just groups), which football-data.org
    # exposes the same way as a domestic league — so it fits the existing
    # sync path. Off-season (no active league-phase table) until ~September;
    # sync will just report "no standings data" until then, which is correct.
    ("champions-league", "UEFA Champions League", "UCL", "europe", 0, True, None),
]

GENERIC_CITY_WORDS = [
    "United", "City", "FC", "Athletic", "Rovers", "Wanderers", "Sporting",
    "Dynamo", "Real", "Olympic", "Union", "Star", "Central", "Rangers",
]


def _slug(name: str) -> str:
    return name.lower().replace(" ", "-").replace(".", "")


def _make_generic_teams(league_id: str, country_name: str, n: int) -> list[str]:
    """Generate plausible filler club names for leagues we didn't hand-author."""
    prefixes = [country_name.split()[0], "Northern", "Southern", "Royal", "National",
                "Coastal", "Capital", "Eastern", "Western", "Metro", "River", "Harbor"]
    names = []
    i = 0
    while len(names) < n:
        prefix = prefixes[i % len(prefixes)]
        suffix = GENERIC_CITY_WORDS[i % len(GENERIC_CITY_WORDS)]
        candidate = f"{prefix} {suffix}"
        if candidate not in names:
            names.append(candidate)
        i += 1
    return names


LEAGUES: dict[str, League] = {}
TEAMS: dict[str, Team] = {}
TEAMS_BY_LEAGUE: dict[str, list[Team]] = {}

for (lid, name, short, country_key, tier, popular, team_names) in LEAGUE_DEFS:
    country = COUNTRIES[country_key]
    n_teams = len(team_names) if team_names else random.choice([14, 16, 18])
    if not team_names:
        team_names = _make_generic_teams(lid, country.name, n_teams)

    league = League(
        id=lid, name=name, short_name=short, country=country,
        logo=f"/logos/leagues/{lid}.svg", season="2025/2026",
        num_teams=len(team_names), tier=tier, popular=popular,
    )
    LEAGUES[lid] = league

    league_teams = []
    for tname in team_names:
        tid = f"{lid}__{_slug(tname)}"
        team = Team(id=tid, name=tname, short_name=tname[:3].upper(),
                    logo=f"/logos/teams/{tid}.svg", league_id=lid)
        TEAMS[tid] = team
        league_teams.append(team)
    TEAMS_BY_LEAGUE[lid] = league_teams


# ---------------------------------------------------------------------------
# Standings (randomized but stable, respects a simple points table)
# ---------------------------------------------------------------------------
def _gen_form() -> list[str]:
    return [random.choice(["W", "W", "D", "L", "L"]) for _ in range(5)]


STANDINGS: dict[str, list[StandingRow]] = {}
for lid, teams in TEAMS_BY_LEAGUE.items():
    played = random.randint(18, 26)
    rows = []
    for team in teams:
        wins = random.randint(0, played)
        draws = random.randint(0, played - wins)
        losses = played - wins - draws
        gf = wins * random.randint(1, 3) + draws
        ga = losses * random.randint(1, 2) + random.randint(0, draws)
        rows.append(StandingRow(
            position=0, team=team, played=played, wins=wins, draws=draws,
            losses=losses, goals_for=gf, goals_against=ga, goal_diff=gf - ga,
            points=wins * 3 + draws, form=_gen_form(),
        ))
    rows.sort(key=lambda r: (r.points, r.goal_diff, r.goals_for), reverse=True)
    for i, r in enumerate(rows, start=1):
        r.position = i
    STANDINGS[lid] = rows


# ---------------------------------------------------------------------------
# Matches: today / tomorrow / yesterday, spread across leagues
# ---------------------------------------------------------------------------
def _gen_prediction() -> Prediction:
    home = random.randint(25, 65)
    away = random.randint(10, 100 - home - 10)
    draw = 100 - home - away
    winner = "home" if home >= max(draw, away) else ("away" if away >= draw else "draw")
    return Prediction(
        home_win_pct=home, draw_pct=draw, away_win_pct=away,
        confidence_pct=max(home, draw, away) + random.randint(0, 15),
        btts_pct=random.randint(35, 75),
        over_1_5_pct=random.randint(55, 90),
        over_2_5_pct=random.randint(30, 70),
        under_2_5_pct=random.randint(30, 70),
        double_chance=random.choice(["1X", "X2", "12"]),
        predicted_winner=winner,
    )


def _random_pair(teams: list[Team]) -> tuple[Team, Team]:
    a, b = random.sample(teams, 2)
    return a, b


MATCHES: dict[str, Match] = {}
now = datetime.now(timezone.utc)

def _build_day_matches(day_offset: int, status_kind: str, n_per_league_max: int = 2):
    for lid, teams in TEAMS_BY_LEAGUE.items():
        if len(teams) < 2:
            continue
        n = random.randint(1, n_per_league_max)
        used = set()
        for _ in range(n):
            home, away = _random_pair(teams)
            key = tuple(sorted([home.id, away.id]))
            if key in used:
                continue
            used.add(key)
            kickoff = (now + timedelta(days=day_offset)).replace(
                hour=random.choice([13, 15, 17, 19, 21]), minute=random.choice([0, 30]),
                second=0, microsecond=0,
            )
            mid = f"{lid}__{home.id}__{away.id}__{day_offset}"
            if status_kind == "finished":
                hs, as_ = random.randint(0, 4), random.randint(0, 4)
                status = MatchStatus(kind="finished", home_score=hs, away_score=as_)
            elif status_kind == "live":
                status = MatchStatus(kind="live", minute=random.randint(1, 90),
                                      home_score=random.randint(0, 3), away_score=random.randint(0, 3))
            else:
                status = MatchStatus(kind="scheduled")

            pred = _gen_prediction()
            correct = None
            if status.kind == "finished":
                actual = "home" if status.home_score > status.away_score else (
                    "away" if status.away_score > status.home_score else "draw")
                correct = (actual == pred.predicted_winner)

            MATCHES[mid] = Match(
                id=mid, league_id=lid, home_team=home, away_team=away, kickoff=kickoff,
                stadium=f"{home.name} Stadium", status=status, prediction=pred,
                featured=(LEAGUES[lid].popular and random.random() < 0.35),
                prediction_correct=correct,
            )

_build_day_matches(0, "scheduled")
_build_day_matches(1, "scheduled")
_build_day_matches(-1, "finished")

# sprinkle a couple of LIVE matches among today's popular-league fixtures for demo realism
today_ids = [m.id for m in MATCHES.values() if m.kickoff.date() == now.date()]
for mid in random.sample(today_ids, min(2, len(today_ids))):
    m = MATCHES[mid]
    m.status = MatchStatus(kind="live", minute=random.randint(1, 90),
                            home_score=random.randint(0, 3), away_score=random.randint(0, 2))


# ---------------------------------------------------------------------------
# Helpers used by routers
# ---------------------------------------------------------------------------
def get_head_to_head(home: Team, away: Team, n: int = 4) -> list[HeadToHead]:
    out = []
    for i in range(n):
        d = now - timedelta(days=200 * (i + 1))
        if i % 2 == 0:
            h, a = home, away
        else:
            h, a = away, home
        out.append(HeadToHead(date=d, home_team=h.name, away_team=a.name,
                               home_score=random.randint(0, 3), away_score=random.randint(0, 3)))
    return out


def get_team_stats(team: Team) -> TeamStats:
    row = next((r for r in STANDINGS[team.league_id] if r.team.id == team.id), None)
    if row is None:
        row = StandingRow(position=1, team=team, played=20, wins=8, draws=6, losses=6,
                           goals_for=25, goals_against=22, goal_diff=3, points=30, form=_gen_form())
    avg_goals = round(row.goals_for / max(row.played, 1), 2)
    return TeamStats(
        team=team, league_position=row.position, played=row.played, wins=row.wins,
        draws=row.draws, losses=row.losses, goals_scored=row.goals_for,
        goals_conceded=row.goals_against, goal_diff=row.goal_diff,
        avg_goals_per_match=avg_goals,
        home_record=f"{random.randint(2,9)}-{random.randint(0,5)}-{random.randint(0,5)}",
        away_record=f"{random.randint(1,7)}-{random.randint(0,5)}-{random.randint(0,6)}",
        last_5=row.form,
    )


def build_match_detail(match: Match) -> MatchDetail:
    return MatchDetail(
        match=match,
        home_stats=get_team_stats(match.home_team),
        away_stats=get_team_stats(match.away_team),
        head_to_head=get_head_to_head(match.home_team, match.away_team),
        standings_snapshot=STANDINGS[match.league_id],
    )
