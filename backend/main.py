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
    """Runs once a day. Pulls real data from SofaScore — no API key needed."""
    from app import sync as sync_module
    try:
        result = sync_module.run_sync()
        logger.info("Daily sync complete: %s", result)
    except Exception:
        logger.exception("Daily sync failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 04:00 UTC daily — after most matches worldwide have finished, before the new day's fixtures matter
    scheduler.add_job(daily_sync_job, "cron", hour=4, minute=0, id="daily_sync")
    # Also run once shortly after boot, in the background, so real data shows
    # up without waiting for the next 04:00 UTC or a manual admin trigger.
    scheduler.add_job(daily_sync_job, "date", id="startup_sync")
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="Football Prediction Hub API",
    version="0.1.0",
    description="Backend for Football Prediction Hub. Pulls real teams/standings/matches "
                 "from SofaScore for mapped leagues on startup and once daily; unmapped "
                 "leagues stay on generated mock data (see docs/API_INTEGRATION.md).",
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
