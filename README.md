# SkillChain

Web3-style NFT certificate demo: **Angular** frontend, **FastAPI** backend, **Hardhat** Solidity contracts (Polygon Mumbai).

## Prerequisites

- Node.js (LTS recommended) and npm
- Python 3.11+ (for local backend)
- Optional: Docker Desktop (for `docker compose`)

## Quick start

### 1. Backend API

```bash
cd backend
python -m pip install -r requirements.txt
```

Ensure `backend/.env` exists with a `SECRET_KEY` of at least 32 characters and optional `GEMINI_API_KEY` for AI suggestions.

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

App: `http://localhost:4200` (calls API at `http://localhost:8000` via `src/environments/environment.ts`).

### 3. Smart contracts (optional)

```bash
cd contracts
npm install
# Set PRIVATE_KEY in contracts/.env for deploy
npx hardhat compile
```

## Docker

From the `SkillChain` folder:

```bash
docker compose up --build
```

This runs the backend on port **8000** with hot reload. Run the Angular app separately with `ng serve` unless you add a frontend service.

## Demo logins

| Role | Username       | Password         |
|------------|----------------|------------------|
| Institution | `institution1` | `institution123` |
| Student     | `student1`     | `student123`     |
| Employer    | `employer1`    | `employer123`    |

## Manual test flow

1. Log in as **institution**, mint a certificate for student wallet `0x2222222222222222222222222222222222222222` (matches `student1`).
2. Log in as **student** — dashboard loads certificates from the API using the JWT wallet; QR links to `http://localhost:4200/verify/{tokenId}`.
3. Open **public verify**: `http://localhost:4200/verify/1` (use the token ID returned from mint).

## Deploy frontend (Vercel)

The app includes `frontend/skillchain-app/vercel.json` SPA rewrites. Set production `apiBaseUrl` / `appBaseUrl` in Angular environment files to match your API and site URL.

## Team Insight Consultants — 2026
