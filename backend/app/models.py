from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Country(BaseModel):
    name: str
    code: str          # ISO-ish short code, used for flag lookup on the frontend
    flag_emoji: str


class League(BaseModel):
    id: str
    name: str
    short_name: str
    country: Country
    logo: str
    season: str
    num_teams: int
    tier: int = 1       # 1 = top flight, 2 = second division, etc.
    popular: bool = False
    data_source: str = "simulated"   # "simulated" | "live" — set to "live" after a successful real sync


class GroupStanding(BaseModel):
    position: int
    team_name: str
    qualified: bool = False
    result_note: str = ""   # e.g. "Group Winner", "Runner-up", "Best Third", "Eliminated"


class CupGroup(BaseModel):
    name: str          # "Group A"
    standings: List[GroupStanding]


class Team(BaseModel):
    id: str
    name: str
    short_name: str
    logo: str
    league_id: str


class StandingRow(BaseModel):
    position: int
    team: Team
    played: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    goal_diff: int
    points: int
    form: List[str] = []   # e.g. ["W", "W", "D", "L", "W"]


class Prediction(BaseModel):
    home_win_pct: int
    draw_pct: int
    away_win_pct: int
    confidence_pct: int
    btts_pct: int
    over_1_5_pct: int
    over_2_5_pct: int
    under_2_5_pct: int
    double_chance: str          # e.g. "1X", "X2", "12"
    predicted_winner: Optional[str] = None
    note: Optional[str] = None  # e.g. "Draws go to extra time and penalties" for knockout matches


class MatchStatus(BaseModel):
    kind: str    # "scheduled" | "live" | "finished"
    minute: Optional[int] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None


class Match(BaseModel):
    id: str
    league_id: str
    home_team: Team
    away_team: Team
    kickoff: datetime
    stadium: Optional[str] = None
    status: MatchStatus
    prediction: Prediction
    featured: bool = False
    prediction_correct: Optional[bool] = None   # filled in for finished matches


class HeadToHead(BaseModel):
    date: datetime
    home_team: str
    away_team: str
    home_score: int
    away_score: int


class TeamStats(BaseModel):
    team: Team
    league_position: int
    played: int
    wins: int
    draws: int
    losses: int
    goals_scored: int
    goals_conceded: int
    goal_diff: int
    avg_goals_per_match: float
    home_record: str     # "W-D-L" style summary e.g. "6-2-1"
    away_record: str
    last_5: List[str]


class MatchDetail(BaseModel):
    match: Match
    home_stats: TeamStats
    away_stats: TeamStats
    head_to_head: List[HeadToHead]
    standings_snapshot: List[StandingRow]


class KnockoutMatch(BaseModel):
    id: str
    round: str          # "Round of 16" | "Quarterfinal" | "Semifinal" | "Third Place" | "Final"
    home_team: Optional[str] = None
    away_team: Optional[str] = None
    home_placeholder: Optional[str] = None   # e.g. "Winner QF1" when team not yet decided
    away_placeholder: Optional[str] = None
    kickoff: datetime
    venue: Optional[str] = None
    status: MatchStatus
    penalty_home: Optional[int] = None
    penalty_away: Optional[int] = None
    prediction: Optional[Prediction] = None
    slot: int = 0        # position within its round, for bracket layout


class Cup(BaseModel):
    id: str
    name: str
    season: str
    host: str
    data_source: str = "simulated"
    snapshot_note: Optional[str] = None   # e.g. "Real results as of Jul 11, 2026"


class CupDetail(BaseModel):
    cup: Cup
    groups: List[CupGroup]
    knockout: List[KnockoutMatch]
