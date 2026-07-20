# Football Prediction Hub

**Live site:** [footballpredictionshub.netlify.app](https://footballpredictionshub.netlify.app)

Football Prediction Hub is a real-time football (soccer) companion site covering the Premier League, Championship, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, Primeira Liga, Brasileirão, and the UEFA Champions League.

It pulls real standings, fixtures, and results directly from a live football data provider — no fake or placeholder matches — and layers a transparent statistical prediction model on top, generating win/draw/loss probabilities, BTTS and over/under goal likelihoods for upcoming matches based on each team's current form, points-per-game, and goal difference. Every league has its own accent color and identity, matches update automatically throughout the day, and every prediction is clearly labeled as a statistical estimate — not betting advice, and not a betting site.

## Features

- Live standings and fixtures across 10 major competitions
- Statistical match predictions with confidence percentages
- Filterable match browser (today/tomorrow/yesterday, live, high-confidence, BTTS, over 2.5 goals)
- Head-to-head history and team form stats on every match page
- Auto-refreshing data, synced from a real provider every 15 minutes

## Tech stack

- **Frontend:** Next.js 14 (App Router), deployed on Netlify
- **Backend:** FastAPI (Python), deployed on Render
- **Data:** [football-data.org](https://www.football-data.org)

## just check it in here https://footballpredictionshub.netlify.app
