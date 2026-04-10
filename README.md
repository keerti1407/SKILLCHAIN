# SkillChain

Web3-style NFT certificate demo: **Angular** frontend, **FastAPI** backend, **Hardhat** Solidity contracts (Polygon Mumbai).

## Prerequisites

- Node.js (LTS recommended) and npm
- Python 3.11+ (for local backend)
- Optional: Docker Desktop (for `docker compose`)

## Security (backend)

- **`SECRET_KEY`** in `backend/.env` must be at least 32 characters. The repo uses:  
  `skillchain_jwt_secret_key_2024_secure_32chars` (hackathon demo — rotate in production).
- **JWT lifetime:** `ACCESS_TOKEN_EXPIRE_MINUTES=60` (60 minutes).
- **CORS:** only `http://localhost:4200` is allowed (see `main.py`).

## Quick start

### 1. Backend API

```bash
cd backend
python -m pip install -r requirements.txt
```

Copy `backend/.env` (not committed) with `SECRET_KEY`, optional `GEMINI_API_KEY` for live AI suggestions (otherwise fallback skills are used).

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API: `http://localhost:8000`

### 2. Frontend

```bash
cd frontend/skillchain-app
npm install
npm start
```

App: `http://localhost:4200` — API URL in `src/environments/environment.ts` (`apiBaseUrl`, `appBaseUrl` for QR codes). Use `productionApiUrl` when deploying the API elsewhere.

### 3. Smart contracts (optional)

```bash
cd contracts
npm install
npx hardhat compile
```

## Seeded demo data

On startup the API preloads **3 certificates** (tokens **1–3**). **`NEXT_TOKEN_ID`** starts at **4** for new mints.

- **student1** (`0x2222…2222`) sees **2** certs: Abhiraj Pal, Ayushi Tiwari.
- **employer1** wallet matches Keerti Singh’s cert (token **3**).
- **Public verify:** `/verify/1` shows **Abhiraj Pal** — Blockchain Development — NDIM Delhi.

## Docker

From the `SkillChain` folder:

```bash
docker compose up --build
```

Backend on port **8000**. Run Angular separately with `ng serve` unless you add a frontend service.

## Render (API)

`render.yaml` defines a **Python** web service with:

- `rootDir: backend`
- `buildCommand: pip install -r requirements.txt`
- `startCommand: uvicorn main:app --host 0.0.0.0 --port 8000`

Set environment variables in the Render dashboard (`SECRET_KEY`, `GEMINI_API_KEY`, etc.).

## Demo logins

| Role        | Username       | Password         |
|-------------|----------------|------------------|
| Institution | `institution1` | `institution123` |
| Student     | `student1`     | `student123`     |
| Employer    | `employer1`    | `employer123`    |

## Manual test flow

1. Log in as **institution**, mint a certificate (new token IDs start at **4**).
2. Log in as **student** — dashboard lists seeded + new certs; QR points to `http://localhost:4200/verify/{tokenId}`.
3. **Employer:** verify token IDs **1**, **2**, or **3**.
4. **Public:** `http://localhost:4200/verify/1` (no login).

## Deploy frontend (Vercel)

`frontend/skillchain-app/vercel.json` rewrites all routes to `index.html`. Point `apiBaseUrl` / `appBaseUrl` / `productionApiUrl` at your deployed API and site.

## Team Insight Consultants — 2026
