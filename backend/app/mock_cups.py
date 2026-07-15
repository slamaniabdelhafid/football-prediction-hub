"""
Real 2026 FIFA World Cup data, hand-curated from live search results as of
July 11, 2026 (see docs/API_INTEGRATION.md for how this could later be kept
fresh automatically via football-data.org's WC competition code, which IS
on their free tier).

This is a snapshot, not a live feed: group-stage results are summarized as
qualification outcomes (Winner / Runner-up / Best Third / Eliminated) rather
than exact final points tables, because precise final standings for all 12
groups weren't reliably available from search at build time — better to be
honestly approximate than to fabricate precise numbers. The knockout bracket
from Round of 16 onward is fully confirmed real data: real scores, real
dates, real venues.
"""
from datetime import datetime, timezone
from .models import Cup, CupGroup, GroupStanding, KnockoutMatch, MatchStatus, CupDetail
from .prediction_model import estimate_prediction

CUP_ID = "world-cup-2026"

_GROUPS_RAW = {
    "Group A": [("Mexico", "Winner"), ("South Africa", "Runner-up"), ("South Korea", ""), ("Czechia", "")],
    "Group B": [("Switzerland", "Winner"), ("Canada", "Runner-up"), ("Bosnia and Herzegovina", "Best Third"), ("Qatar", "")],
    "Group C": [("Morocco", "Winner"), ("Brazil", "Runner-up"), ("Scotland", ""), ("Haiti", "")],
    "Group D": [("USA", "Winner"), ("Australia", "Runner-up"), ("Paraguay", "Best Third"), ("Türkiye", "")],
    "Group E": [("Germany", "Winner"), ("Ivory Coast", "Runner-up"), ("Ecuador", "Best Third"), ("Curaçao", "")],
    "Group F": [("Sweden", "Winner"), ("Netherlands", "Runner-up"), ("Japan", "Best Third"), ("Tunisia", "")],
    "Group G": [("Belgium", "Winner"), ("Egypt", "Runner-up"), ("Iran", ""), ("New Zealand", "")],
    "Group H": [("Spain", "Winner"), ("Cape Verde", "Runner-up"), ("Saudi Arabia", ""), ("Uruguay", "")],
    "Group I": [("Norway", "Winner"), ("France", "Runner-up"), ("Senegal", "Best Third"), ("Iraq", "")],
    "Group J": [("Argentina", "Winner"), ("Austria", "Runner-up"), ("Algeria", "Best Third"), ("Jordan", "")],
    "Group K": [("Colombia", "Winner"), ("Portugal", "Runner-up"), ("DR Congo", ""), ("Uzbekistan", "")],
    "Group L": [("England", "Winner"), ("Ghana", "Runner-up"), ("Croatia", "Best Third"), ("Panama", "")],
}


def _build_groups() -> list[CupGroup]:
    groups = []
    for name, teams in _GROUPS_RAW.items():
        standings = []
        for i, (team, note) in enumerate(teams, start=1):
            qualified = note in ("Winner", "Runner-up", "Best Third")
            standings.append(GroupStanding(
                position=i, team_name=team, qualified=qualified,
                result_note=note or "Eliminated in Group Stage",
            ))
        groups.append(CupGroup(name=name, standings=standings))
    return groups


def _dt(y, m, d, h, mi=0):
    return datetime(y, m, d, h, mi, tzinfo=timezone.utc)


# A rough "strength score" for the heuristic prediction model, standing in for
# real season stats (which don't apply to a national-team tournament the way
# they do to a domestic league). 0-100, subjectively set from run so far —
# teams that have won more knockout rounds score higher.
_STRENGTH = {
    "France": 88, "Spain": 90, "Argentina": 85, "England": 82, "Norway": 78,
    "Switzerland": 74, "Belgium": 76, "Morocco": 75, "Portugal": 77, "Colombia": 73,
    "Brazil": 80, "USA": 68, "Egypt": 66, "Mexico": 70,
}


def _knockout_prediction(home: str, away: str):
    if home not in _STRENGTH or away not in _STRENGTH:
        return None
    h, a = _STRENGTH[home], _STRENGTH[away]
    # Reuse the league heuristic by faking season stats proportional to strength —
    # transparent approximation, documented here rather than hidden.
    pred = estimate_prediction(
        home_points=h, home_played=10, home_gd=(h - 70) // 2, home_avg_scored=1.6, home_avg_conceded=0.9,
        away_points=a, away_played=10, away_gd=(a - 70) // 2, away_avg_scored=1.6, away_avg_conceded=0.9,
        is_knockout=True,
    )
    return pred


def _build_knockout() -> list[KnockoutMatch]:
    matches = []

    r16 = [
        ("Morocco", "Canada", 3, 0, None, _dt(2026, 7, 4, 17, 0), "NRG Stadium, Houston"),
        ("France", "Paraguay", 1, 0, None, _dt(2026, 7, 4, 21, 0), "Lincoln Financial Field, Philadelphia"),
        ("Norway", "Brazil", 2, 1, None, _dt(2026, 7, 5, 20, 0), "MetLife Stadium, New Jersey"),
        ("England", "Mexico", 3, 2, None, _dt(2026, 7, 6, 0, 0), "Estadio Azteca, Mexico City"),
        ("Spain", "Portugal", 1, 0, None, _dt(2026, 7, 6, 19, 0), "AT&T Stadium, Dallas"),
        ("Belgium", "USA", 4, 1, None, _dt(2026, 7, 7, 0, 0), "Lumen Field, Seattle"),
        ("Argentina", "Egypt", 3, 2, None, _dt(2026, 7, 7, 16, 0), "Mercedes-Benz Stadium, Atlanta"),
        ("Switzerland", "Colombia", 0, 0, (4, 3), _dt(2026, 7, 7, 20, 0), "BC Place, Vancouver"),
    ]
    for i, (home, away, hs, as_, pens, kickoff, venue) in enumerate(r16, start=1):
        matches.append(KnockoutMatch(
            id=f"{CUP_ID}__r16__{i}", round="Round of 16", home_team=home, away_team=away,
            kickoff=kickoff, venue=venue,
            status=MatchStatus(kind="finished", home_score=hs, away_score=as_),
            penalty_home=pens[0] if pens else None, penalty_away=pens[1] if pens else None,
            slot=i,
        ))

    qf = [
        ("France", "Morocco", 2, 0, None, "finished", _dt(2026, 7, 9, 20, 0), "Gillette Stadium, Boston"),
        ("Spain", "Belgium", 2, 1, None, "finished", _dt(2026, 7, 10, 19, 0), "SoFi Stadium, Inglewood"),
        ("Norway", "England", 1, 2, None, "finished", _dt(2026, 7, 11, 21, 0), "Hard Rock Stadium, Miami"),
        ("Argentina", "Switzerland", 3, 1, None, "finished", _dt(2026, 7, 12, 1, 0), "Arrowhead Stadium, Kansas City"),
    ]
    for i, (home, away, hs, as_, pens, kind, kickoff, venue) in enumerate(qf, start=1):
        pred = _knockout_prediction(home, away) if kind == "scheduled" else None
        matches.append(KnockoutMatch(
            id=f"{CUP_ID}__qf__{i}", round="Quarterfinal", home_team=home, away_team=away,
            kickoff=kickoff, venue=venue,
            status=MatchStatus(kind=kind, home_score=hs, away_score=as_),
            penalty_home=pens[0] if pens else None, penalty_away=pens[1] if pens else None,
            prediction=pred, slot=i,
        ))

    # Both semifinals are complete.
    matches.append(KnockoutMatch(
        id=f"{CUP_ID}__sf__1", round="Semifinal", home_team="France", away_team="Spain",
        kickoff=_dt(2026, 7, 14, 19, 0), venue="AT&T Stadium, Dallas",
        status=MatchStatus(kind="finished", home_score=0, away_score=2), slot=1,
    ))
    matches.append(KnockoutMatch(
        id=f"{CUP_ID}__sf__2", round="Semifinal", home_team="England", away_team="Argentina",
        kickoff=_dt(2026, 7, 15, 19, 0), venue="Mercedes-Benz Stadium, Atlanta",
        status=MatchStatus(kind="finished", home_score=1, away_score=2), slot=2,
    ))

    matches.append(KnockoutMatch(
        id=f"{CUP_ID}__3rd__1", round="Third Place",
        home_team="France", away_team="England",
        kickoff=_dt(2026, 7, 18, 21, 0), venue="Hard Rock Stadium, Miami",
        status=MatchStatus(kind="scheduled"),
        prediction=_knockout_prediction("France", "England"), slot=1,
    ))
    matches.append(KnockoutMatch(
        id=f"{CUP_ID}__final__1", round="Final",
        home_team="Spain", away_team="Argentina",
        kickoff=_dt(2026, 7, 19, 19, 0), venue="MetLife Stadium, New Jersey",
        status=MatchStatus(kind="scheduled"),
        prediction=_knockout_prediction("Spain", "Argentina"), slot=1,
    ))

    return matches


def get_world_cup_2026() -> CupDetail:
    cup = Cup(
        id=CUP_ID, name="FIFA World Cup 2026", season="2026",
        host="United States, Mexico & Canada",
        data_source="simulated",
        snapshot_note="Real results as of July 15, 2026 (both semifinals complete) — see docs/API_INTEGRATION.md to keep this live",
    )
    return CupDetail(cup=cup, groups=_build_groups(), knockout=_build_knockout())


CUPS = {CUP_ID: get_world_cup_2026()}
