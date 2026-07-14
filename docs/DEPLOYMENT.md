# Deployment

## Local development (WSL)
```bash
# Terminal 1 — backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add FOOTBALL_DATA_API_KEY if you have one
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```
Visit http://localhost:3000. API docs at http://localhost:8000/docs.

## Production: an honest note about Hostinger
This app has two moving parts — a Python (FastAPI) backend and a Next.js
frontend that fetches from it **server-side** on every page load (for daily-
fresh data). That means both need to run as long-lived processes, not just
serve static files.

- **Hostinger shared/business hosting** (the plan ConverterHub is likely on)
  is built for PHP + static files. It does not run Python or a persistent
  Node.js server, so FastAPI and `next start` won't work there directly.
- **Hostinger VPS** (KVM plans) is a real Ubuntu server — this works fine,
  same as any VPS. Steps below assume this.
- Alternative: split the stack — backend on a Python-friendly host (Railway,
  Render, Fly.io all have free/cheap tiers), frontend on Vercel (built for
  Next.js) or a Hostinger VPS. Point `NEXT_PUBLIC_API_BASE` at wherever the
  backend ends up.

## Deploying to a Hostinger VPS (or any Ubuntu VPS)

**1. Server setup**
```bash
sudo apt update && sudo apt install -y python3-venv nodejs npm nginx
sudo npm install -g pm2
```

**2. Backend as a systemd-style service (via pm2)**
```bash
cd /var/www/football-prediction-hub/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set FOOTBALL_DATA_API_KEY
deactivate
pm2 start "venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000" --name fph-backend
```

**3. Frontend**
```bash
cd /var/www/football-prediction-hub/frontend
cp .env.local.example .env.local
# set NEXT_PUBLIC_API_BASE=https://yourdomain.com/api  (see Nginx config below)
npm install
npm run build
pm2 start "npm run start -- -p 3000" --name fph-frontend
pm2 save
```

**4. Nginx reverse proxy** — `/etc/nginx/sites-available/football-prediction-hub`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/football-prediction-hub /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**5. HTTPS** — free via Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**6. CORS** — in `backend/main.py`, change `allow_origins=["http://localhost:3000"]`
to your real domain before going live.

## Keeping data fresh in production
The APScheduler job in `main.py` runs inside the backend process, so as long
as `fph-backend` stays running under pm2, the 04:00 UTC daily sync happens
automatically once `FOOTBALL_DATA_API_KEY` is set. `pm2 save` + `pm2 startup`
ensures both processes restart if the VPS reboots.
