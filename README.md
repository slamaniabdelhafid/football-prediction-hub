# Football Prediction Hub

See `PROJECT_PLAN.md` for the stage tracker and `docs/DESIGN.md` for the visual direction.

## Run locally (WSL / Linux / Mac)

**Backend (FastAPI, mock data for now):**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

**Frontend (Next.js):**
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```
Site: http://localhost:3000

Both need to be running at the same time — the frontend fetches from the backend at
`NEXT_PUBLIC_API_BASE` (defaults to `http://localhost:8000`).

## Status
Stage 1 (backend) and Stage 2 (homepage) are complete and have been build-tested.
Remaining stages are tracked in `PROJECT_PLAN.md`.
