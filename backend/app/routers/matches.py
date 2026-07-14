from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta, timezone
from typing import Optional
from .. import mock_data as md

router = APIRouter(prefix="/api/matches", tags=["matches"])


def _day_matches(offset: int):
    target = (datetime.now(timezone.utc) + timedelta(days=offset)).date()
    return [m for m in md.MATCHES.values() if m.kickoff.date() == target]


@router.get("")
def list_matches(
    day: Optional[str] = Query(None, description="today | tomorrow | yesterday"),
    status: Optional[str] = Query(None, description="scheduled | live | finished"),
    min_confidence: Optional[int] = None,
    btts_min: Optional[int] = None,
    over_2_5_min: Optional[int] = None,
):
    """General-purpose filterable match listing backing the site's Filters bar."""
    matches = list(md.MATCHES.values())

    if day == "today":
        matches = [m for m in matches if m in _day_matches(0)]
    elif day == "tomorrow":
        matches = [m for m in matches if m in _day_matches(1)]
    elif day == "yesterday":
        matches = [m for m in matches if m in _day_matches(-1)]

    if status:
        matches = [m for m in matches if m.status.kind == status]
    if min_confidence is not None:
        matches = [m for m in matches if m.prediction.confidence_pct >= min_confidence]
    if btts_min is not None:
        matches = [m for m in matches if m.prediction.btts_pct >= btts_min]
    if over_2_5_min is not None:
        matches = [m for m in matches if m.prediction.over_2_5_pct >= over_2_5_min]

    return sorted(matches, key=lambda m: m.kickoff)


@router.get("/today")
def matches_today():
    return sorted(_day_matches(0), key=lambda m: m.kickoff)


@router.get("/tomorrow")
def matches_tomorrow():
    return sorted(_day_matches(1), key=lambda m: m.kickoff)


@router.get("/yesterday")
def matches_yesterday():
    return sorted(_day_matches(-1), key=lambda m: m.kickoff)


@router.get("/live")
def matches_live():
    return [m for m in md.MATCHES.values() if m.status.kind == "live"]


@router.get("/featured")
def matches_featured():
    return [m for m in md.MATCHES.values() if m.featured]


@router.get("/top-predictions")
def top_predictions(min_confidence: int = 85):
    ms = [m for m in md.MATCHES.values()
          if m.status.kind == "scheduled" and m.prediction.confidence_pct >= min_confidence]
    return sorted(ms, key=lambda m: m.prediction.confidence_pct, reverse=True)


@router.get("/search")
def search_matches(q: str = Query(..., min_length=2)):
    q_low = q.lower()
    results = [
        m for m in md.MATCHES.values()
        if q_low in m.home_team.name.lower()
        or q_low in m.away_team.name.lower()
        or q_low in md.LEAGUES[m.league_id].name.lower()
    ]
    return sorted(results, key=lambda m: m.kickoff)[:30]


@router.get("/{match_id}")
def get_match_detail(match_id: str):
    match = md.MATCHES.get(match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return md.build_match_detail(match)
