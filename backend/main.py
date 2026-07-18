import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

from app.routers import leagues, matches, admin, cups

load_dotenv()  # reads backend/.env if present

logger = logging.getLogger("football_prediction_hub")

scheduler = BackgroundScheduler()


def daily_sync_job():
    """
    Runs every 15 minutes (see lifespan() below). No-op (logs and returns)
    if no API key is configured. Function name kept from when this ran once
    a day — it's the same job, just scheduled more often now.
    """
    if not os.environ.get("FOOTBALL_DATA_API_KEY"):
        logger.info("Sync skipped: FOOTBALL_DATA_API_KEY not set (mock-data mode).")
        return
    from app import sync as sync_module
    try:
        result = sync_module.run_sync()
        logger.info("Sync complete: %s", result)
    except Exception:
        logger.exception("Sync failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not os.environ.get("ADMIN_SECRET"):
        logger.warning(
            "ADMIN_SECRET is not set — /api/admin/* routes are OPEN to anyone who finds "
            "the URL. Set ADMIN_SECRET as an env var before sharing this site publicly."
        )

    # Every 15 minutes: a full sync is ~20 API calls (2 per mapped league)
    # spaced ~7s apart by sync.py's own rate limiting, so one run takes ~2-2.5
    # minutes. 15-minute spacing keeps this comfortably under football-data.org's
    # 10-requests/minute free-tier cap over any rolling window, while still
    # being close to real-time for scores. A 5-minute interval was considered
    # but rejected: back-to-back runs could still be finishing (or the lock in
    # sync.py would just skip the overlapping one — see SYNC_LOCK), and it's
    # a lot more continuous load on a free public API than it needs for data
    # that mostly changes a few times an hour anyway.
    scheduler.add_job(daily_sync_job, "interval", minutes=15, id="periodic_sync")
    # Also run once shortly after boot, in the background, so real data shows
    # up without waiting 15 minutes or a manual admin trigger.
    scheduler.add_job(daily_sync_job, "date", id="startup_sync")
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="Football Prediction Hub API",
    version="0.1.0",
    description="Backend for Football Prediction Hub. Runs on mock data by default; "
                 "set FOOTBALL_DATA_API_KEY to enable real data for mapped leagues, "
                 "and ADMIN_SECRET to protect /api/admin/* (see docs/API_INTEGRATION.md).",
    lifespan=lifespan,
)

# Comma-separated list in ALLOWED_ORIGINS env var, e.g.
# "http://localhost:3000,https://your-site.netlify.app". Falls back to
# localhost only, so you must set this in production.
_default_origins = "http://localhost:3000"
allowed_origins = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leagues.router)
app.include_router(matches.router)
app.include_router(admin.router)
app.include_router(cups.router)


@app.get("/api/health")
def health():
    from app import mock_data as md
    any_live = any(league.data_source == "live" for league in md.LEAGUES.values())
    return {
        "status": "ok",
        "mode": "live-data" if any_live else "mock-data",
    }
