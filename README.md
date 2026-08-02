# SigmaFolio — AI-Powered Stock Portfolio Analyzer & Advisor

A full-stack MERN application for tracking a stock portfolio, viewing live prices and technical indicators, and getting AI-generated risk/diversification insights.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4, Zustand, React Router, Recharts, Socket.io-client
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT auth
- **Stock data:** [Finnhub](https://finnhub.io) (free tier) — with automatic mock-data fallback if no key is configured
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`) — narrates pre-computed, deterministic risk scores in plain English. Falls back to a template-based explanation if no key is configured.

## Project Structure

```
stock-advisor/
├── backend/
│   └── src/
│       ├── config/        # DB connection
│       ├── models/        # User, Holding, Transaction, Watchlist, PortfolioSnapshot
│       ├── controllers/   # Route handlers
│       ├── routes/        # Express routers
│       ├── middleware/    # auth, validation, error handling
│       ├── services/      # business logic (portfolio math, Finnhub, risk scoring, AI, sockets)
│       └── utils/         # JWT, cache, technical indicators, mock data
└── frontend/
    └── src/
        ├── api/            # axios + socket.io clients
        ├── store/          # Zustand stores (auth, portfolio, watchlist)
        ├── components/     # ui/, auth/, portfolio/, stock/, insights/
        ├── pages/          # Login, Signup, Dashboard, StockDetail, Insights, Watchlist, TransactionHistory
        ├── layouts/         # AuthLayout, AppShell
        └── hooks/          # useLivePrices
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Required — get a free cluster at https://www.mongodb.com/cloud/atlas
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/stock-advisor

# Required — any random long string
JWT_SECRET=replace_this_with_a_long_random_secret_string

# Optional — app works in demo mode without these (see below)
FINNHUB_API_KEY=
ANTHROPIC_API_KEY=
```

```bash
npm run dev
```

Server runs on `http://localhost:5000`. Health check: `GET /api/v1/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`. The Vite dev server proxies `/api` and `/socket.io` to the backend automatically — no CORS config needed in development.

## Running Without API Keys (Demo Mode)

The app is fully usable without any third-party API keys:

- **No `FINNHUB_API_KEY`** → stock quotes, candles, and news are served from a deterministic mock generator. A "Demo data" badge appears on the stock detail page.
- **No `ANTHROPIC_API_KEY`** → the AI Insights page still shows a real risk score (calculated, not mocked) with a template-generated plain-English summary instead of an LLM-written one. A "Demo summary" badge appears.

You only need MongoDB Atlas (free tier) and a JWT secret to run the full app locally.

### Getting free API keys (optional, for live data)

- **Finnhub:** https://finnhub.io/register — free tier gives 60 calls/minute, real-time US stock quotes, news, and fundamentals.
- **Anthropic:** https://console.anthropic.com — create an API key under your account settings.

## Key Design Decisions

- **Risk scoring is deterministic, not LLM-generated.** Concentration and sector-diversification scores are calculated with pure functions (`riskScoringService.js`). The LLM is only used to *narrate* those pre-computed numbers in plain English — it's explicitly instructed not to invent or recalculate any figures. This keeps the numbers a user might act on auditable and reproducible.
- **Caching everywhere external APIs are called**, with TTLs tuned per data type (quotes 30s, profiles 24h, news 10m), to stay within Finnhub's free-tier rate limit.
- **Mock-data fallback** on every external service call (Finnhub and Anthropic both), so the app degrades gracefully instead of breaking when a key is missing or a call fails.
- **Live prices via Socket.io**, with per-symbol subscriptions — the server only polls Finnhub for symbols someone is actively viewing, not the whole stock universe.
- **Price alerts re-arm on edit, not on every poll.** Once an alert fires it's marked `alertTriggeredAt` and won't fire again until the user changes the target price or direction — prevents repeat-notification spam from a price oscillating around the target.
- **Portfolio snapshots are upserted per calendar day (UTC).** Calling the portfolio endpoint multiple times in a day overwrites that day's snapshot rather than creating duplicates, so the performance chart stays accurate without needing a separate cron job.

## What's Included

- **Auth** — JWT-based signup/login, bcrypt password hashing, rate-limited auth endpoints.
- **Portfolio tracking** — add/edit/sell holdings, weighted-average buy price on repeat buys, full transaction history.
- **Live prices** — Socket.io push updates, per-symbol subscriptions, batch quote fetching.
- **Stock detail page** — price chart with SMA20/SMA50 overlays, RSI, company news.
- **AI Insights** — deterministic risk/diversification scoring, narrated in plain English by Claude (with a non-AI fallback).
- **Watchlist with price alerts** — track symbols you don't hold, set an above/below target price, get a real-time toast notification when it's hit.
- **Portfolio performance chart** — daily value snapshots charted over time.

## Note on "Real Trading"

This app is a **portfolio tracker and analyzer, not a trading platform.** Adding a holding is a manual record of a trade you made elsewhere (e.g. through a real broker) — no real orders are placed and no real money moves through this app. Live prices and AI insights are there to help you understand a portfolio you already manage, not to execute trades. Connecting to a real broker (e.g. Zerodha Kite Connect) for read-only holdings sync would be a reasonable next step; placing real orders would require regulatory compliance well beyond this project's scope.

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Create account |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/portfolio` | Holdings + computed summary (also captures today's snapshot) |
| GET | `/api/v1/portfolio/performance` | Daily portfolio value history for the performance chart (`?days=`) |
| POST | `/api/v1/portfolio/holdings` | Add holding (BUY, logs a transaction) |
| PATCH | `/api/v1/portfolio/holdings/:id` | Edit holding |
| DELETE | `/api/v1/portfolio/holdings/:id` | Remove holding (logs a full SELL) |
| POST | `/api/v1/portfolio/holdings/:id/sell` | Sell a quantity (partial or full, logs a SELL) |
| GET | `/api/v1/portfolio/transactions` | Buy/sell transaction history (optional `?symbol=`) |
| POST | `/api/v1/portfolio/refresh-prices` | Refresh all holdings with live quotes |
| GET | `/api/v1/stocks/detail/:symbol` | Combined quote + profile + candles + indicators + news |
| GET | `/api/v1/insights` | Risk score + AI explanation |
| GET | `/api/v1/watchlist` | Watched symbols with live quotes + alert status |
| POST | `/api/v1/watchlist` | Add a symbol to watchlist (with optional price alert) |
| PATCH | `/api/v1/watchlist/:id` | Edit a watchlist entry (note/target price/alert direction) |
| DELETE | `/api/v1/watchlist/:id` | Remove from watchlist |

All routes except `/auth/signup` and `/auth/login` require a `Bearer` token or auth cookie.

## Known Limitations / Next Steps

- Finnhub free tier is US-equities focused; Indian/NSE stocks would need a different data provider.
- Sector risk weights in `riskScoringService.js` are a simplified heuristic, not a real beta/volatility calculation — fine for an MVP, but a production version should pull historical volatility instead.
- No automated test suite is wired up yet (all logic was verified via one-off scripts during development) — adding Jest/Vitest with the same test cases would be a good next step.
- Socket.io polling interval (15s) is conservative to respect Finnhub's free-tier rate limit; a paid tier would allow tighter intervals.
