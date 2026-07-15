from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import os
from .. import mock_data as md

router = APIRouter(prefix="/api/admin", tags=["admin"])

# In-memory "state" for the demo — in Stage 7 this becomes real DB rows.
_state = {
    "last_sync": datetime.now(timezone.utc),
    "sync_log": [
        {"time": datetime.now(timezone.utc).isoformat(), "status": "ok", "detail": "Initial mock data generated"},
    ],
}


@router.get("/stats")
def dashboard_stats():
    return {
        "total_leagues": len(md.LEAGUES),
        "total_teams": len(md.TEAMS),
        "total_matches": len(md.MATCHES),
        "matches_today": len([m for m in md.MATCHES.values()
                               if m.kickoff.date() == datetime.now(timezone.utc).date()]),
        "api_status": "mock-data-mode",
        "last_sync": _state["last_sync"],
    }


@router.post("/matches/{match_id}/feature")
def feature_match(match_id: str, featured: bool = True):
    match = md.MATCHES.get(match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    match.featured = featured
    return {"ok": True, "match_id": match_id, "featured": featured}


@router.post("/leagues/{league_id}/toggle")
def toggle_league(league_id: str, enabled: bool = True):
    league = md.LEAGUES.get(league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    league.popular = enabled  # placeholder toggle for the demo
    return {"ok": True, "league_id": league_id, "enabled": enabled}


@router.post("/sync")
def trigger_sync():
    """
    If FOOTBALL_DATA_API_KEY is set, pulls real data for the mapped leagues
    (see app/providers/football_data.py). Otherwise logs a clear "no key"
    entry rather than silently doing nothing.
    """
    _state["last_sync"] = datetime.now(timezone.utc)

    if not os.environ.get("FOOTBALL_DATA_API_KEY"):
        detail = (
            "No FOOTBALL_DATA_API_KEY set — get a free key at "
            "football-data.org/client/register and set it as an env var, then retry."
        )
        status = "error"
    else:
        from .. import sync as sync_module
        try:
            result = sync_module.run_sync()
            detail = (
                f"Synced {len(result['synced_leagues'])} leagues, "
                f"{result['matches_synced']} matches, from football-data.org"
            )
            if result["failed_leagues"]:
                reasons = "; ".join(f"{f['league_id']}: {f['error']}" for f in result["failed_leagues"])
                detail += f" — FAILED: {reasons}"
            status = "ok" if not result["failed_leagues"] else "partial"
        except Exception as e:
            detail = f"Live sync failed: {e}"
            status = "error"

    _state["sync_log"].insert(0, {"time": _state["last_sync"].isoformat(), "status": status, "detail": detail})
    return {"ok": status != "error", "last_sync": _state["last_sync"], "detail": detail}


@router.get("/logs")
def sync_logs():
    return _state["sync_log"]
