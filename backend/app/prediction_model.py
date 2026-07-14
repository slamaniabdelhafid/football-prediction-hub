"""
Football-Data.org (and most free providers) give you fixtures, results, and
standings — but NOT win-probability predictions. Those have to be computed.

This is a small, transparent statistical model, not a black box:
  1. Season strength = points-per-game + 0.5 * goal-difference-per-game
  2. Recent-form strength = points-per-game over the last 5 matches only
     (W=3, D=1, L=0), so a team on a hot or cold streak shifts the number
     even if their season-long record says otherwise
  3. Blended strength = 70% season + 30% recent form
  4. Home advantage: +0.25 added to the home side's blended strength
  5. The strength gap is passed through a logistic curve to get a home/away
     split, and the draw probability shrinks as the gap widens (close teams
     draw more often than mismatched ones)
  6. BTTS / Over-Under are derived from each team's average goals scored
     and conceded

It's deliberately simple and explainable rather than "AI-sounding" — matching
the spec's request for clean numerical predictions, not written explanations.
"""
import math
from typing import Optional
from .models import Prediction

_FORM_POINTS = {"W": 3, "D": 1, "L": 0}


def _team_strength(points: int, played: int, goal_diff: int, form: Optional[list[str]] = None) -> float:
    if played == 0:
        return 1.0
    season_ppg = points / played
    gdpg = goal_diff / played
    season_strength = season_ppg + 0.5 * gdpg

    if form:
        form_ppg = sum(_FORM_POINTS.get(f, 1) for f in form) / len(form)
        return 0.7 * season_strength + 0.3 * form_ppg
    return season_strength


def _logistic(x: float) -> float:
    return 1 / (1 + math.exp(-x))


def estimate_prediction(
    home_points: int, home_played: int, home_gd: int, home_avg_scored: float, home_avg_conceded: float,
    away_points: int, away_played: int, away_gd: int, away_avg_scored: float, away_avg_conceded: float,
    home_form: Optional[list[str]] = None, away_form: Optional[list[str]] = None,
    is_knockout: bool = False,
) -> Prediction:
    home_strength = _team_strength(home_points, home_played, home_gd, home_form) + 0.25  # home advantage
    away_strength = _team_strength(away_points, away_played, away_gd, away_form)
    gap = home_strength - away_strength

    # Win split via logistic curve on the strength gap
    home_edge = _logistic(gap * 1.3)  # 0..1, how much home "should" win vs away
    # Draw shrinks as |gap| grows — close matches draw more. Knockout matches
    # (which go to extra time + penalties rather than staying drawn) get a
    # smaller draw allowance since a "draw" there just means a coin-flip decider.
    draw_base = (0.22 if is_knockout else 0.30) * math.exp(-abs(gap) * 0.6)

    home_win = home_edge * (1 - draw_base)
    away_win = (1 - home_edge) * (1 - draw_base)
    draw = draw_base

    total = home_win + away_win + draw
    home_pct = round(home_win / total * 100)
    away_pct = round(away_win / total * 100)
    draw_pct = 100 - home_pct - away_pct  # remainder, keeps it summing to 100

    expected_goals = max(0.5, (home_avg_scored + away_avg_conceded) / 2) + \
                      max(0.5, (away_avg_scored + home_avg_conceded) / 2)
    over_2_5 = min(95, max(15, round((expected_goals - 1.5) * 35 + 50)))
    over_1_5 = min(97, over_2_5 + 20)
    under_2_5 = 100 - over_2_5
    btts = min(90, max(20, round(min(home_avg_scored, away_avg_scored) * 45 + 30)))

    predicted = "home" if home_pct >= max(draw_pct, away_pct) else (
        "away" if away_pct >= draw_pct else "draw")
    confidence = max(home_pct, draw_pct, away_pct) + round(abs(gap) * 8)

    double_chance = "1X" if (home_pct + draw_pct) >= (away_pct + draw_pct) else "X2"
    if abs(home_pct - away_pct) < 8:
        double_chance = "12"

    return Prediction(
        home_win_pct=home_pct, draw_pct=draw_pct, away_win_pct=away_pct,
        confidence_pct=min(confidence, 99),
        btts_pct=btts, over_1_5_pct=over_1_5, over_2_5_pct=over_2_5, under_2_5_pct=under_2_5,
        double_chance=double_chance, predicted_winner=predicted,
        note="Draws go to extra time and penalties" if is_knockout else None,
    )
