from fastapi import APIRouter, HTTPException
from collections import defaultdict
from typing import Optional
from .. import mock_data as md

router = APIRouter(prefix="/api/leagues", tags=["leagues"])


@router.get("")
def list_leagues(country: Optional[str] = None, popular_only: bool = False):
    leagues = list(md.LEAGUES.values())
    if country:
        leagues = [l for l in leagues if l.country.name.lower() == country.lower()]
    if popular_only:
        leagues = [l for l in leagues if l.popular]

    grouped = defaultdict(list)
    for l in leagues:
        grouped[l.country.name].append(l)
    return {
        "total": len(leagues),
        "countries": [
            {"country": country_name, "flag_emoji": items[0].country.flag_emoji, "leagues": items}
            for country_name, items in sorted(grouped.items())
        ],
    }


@router.get("/{league_id}")
def get_league(league_id: str):
    league = md.LEAGUES.get(league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    return league


@router.get("/{league_id}/standings")
def get_standings(league_id: str):
    if league_id not in md.LEAGUES:
        raise HTTPException(status_code=404, detail="League not found")
    return md.STANDINGS[league_id]


@router.get("/{league_id}/fixtures")
def get_fixtures(league_id: str):
    if league_id not in md.LEAGUES:
        raise HTTPException(status_code=404, detail="League not found")
    matches = [m for m in md.MATCHES.values()
               if m.league_id == league_id and m.status.kind == "scheduled"]
    return sorted(matches, key=lambda m: m.kickoff)


@router.get("/{league_id}/results")
def get_results(league_id: str):
    if league_id not in md.LEAGUES:
        raise HTTPException(status_code=404, detail="League not found")
    matches = [m for m in md.MATCHES.values()
               if m.league_id == league_id and m.status.kind == "finished"]
    return sorted(matches, key=lambda m: m.kickoff, reverse=True)
