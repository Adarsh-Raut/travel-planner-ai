# AI Travel Planner

Generate complete day-by-day travel itineraries with an LLM agent — including budget
estimates and hotel suggestions. Users register, describe a trip (destination, days, budget
level, interests), and receive an editable plan powered by **Google Gemini** with automatic
**Groq** failover.

> Full-stack assessment build — TypeScript throughout, monorepo with a Next.js frontend and
> an Express backend.

## Features

- **Multi-user accounts** — email/password registration & login, JWT sessions, strict per-user trip isolation
- **AI itinerary generation** — day-by-day activities, server-computed budget breakdown, and hotel picks across tiers (Gemini primary, Groq fallback)
- **Editable itinerary** — add/remove activities (10/day cap), regenerate a single day with free-text instructions
- **Draft-input editing** — tweak destination, days, budget, and interests before generating
- **Public trip sharing** — read-only share links via capability tokens, with instant revoke

## Architecture

```
┌─────────────────┐      fetch (credentials)      ┌──────────────────────┐
│  Next.js client  │ ───────────────────────────▶ │   Express API         │
│  (Vercel)        │                              │   (Render)            │
│  app.vercel.app  │ ◀──── JWT cookie (SameSite) ──│   travel-planner.onrender.com
└─────────────────┘                              └──────────┬───────────┘
                                                            │ Mongoose
                                                   ┌────────▼─────────┐
                                                   │  MongoDB Atlas    │
                                                   └──────────────────┘
```

The frontend is a single-page app (Next.js App Router) that calls the backend over HTTP.
The JWT is stored in an **httpOnly cookie on the backend domain**; the browser sends it on
every request via `credentials: "include"`. The backend is the source of truth for
authorization — a `requireAuth` middleware runs on every protected route.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui (Radix), React Compiler |
| Backend | Node.js + Express 5, Mongoose 9, TypeScript (ESM, NodeNext) |
| Database | MongoDB Atlas (free tier) |
| Auth | bcrypt (cost 12) + JWT (HS256) in httpOnly cookie |
| AI | Google Gemini (`gemini-3.5-flash-lite`) primary → Groq (`openai/gpt-oss-120b`) fallback |
| Logging | pino + pino-http (redacts cookies / authorization / passwords) |

## Getting Started (local)

**Prerequisites:** Node.js 20+, a MongoDB Atlas connection string, and API keys for Gemini
and/or Groq.

```bash
# 1. Install both apps
cd server && npm install
cd ../client && npm install

# 2. Environment
cp server/.env.example server/.env      # fill in MONGODB_URI, JWT_SECRET, API keys
cp client/.env.example client/.env.local # NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Run (two terminals)
cd server && npm run dev      # http://localhost:8000
cd client && npm run dev      # http://localhost:3000
```

The server prints `Server listening on port 8000` and connects to Atlas on boot. A missing
`MONGODB_URI` aborts startup. Generate a JWT secret with `openssl rand -base64 48`.

## API Reference

All responses use `{ data }` on success and `{ error: { code, message, details? } }` on failure.

| Method & Path | Auth | Result |
|---|---|---|
| `GET /health` | — | `{ status, database, timestamp }` |
| `POST /api/auth/register` | — | 201 `{ user }` |
| `POST /api/auth/login` | — | 200 `{ user }` + `Set-Cookie` |
| `POST /api/auth/logout` | — | 200 (clears cookie) |
| `GET /api/auth/me` | ✔ | 200 `{ user }` |
| `POST /api/trips` | ✔ | 201 `{ trip }` (status `draft`) |
| `GET /api/trips` | ✔ | 200 `{ trips }` (owner's only) |
| `GET /api/trips/:id` | ✔ | 200 `{ trip }` |
| `PATCH /api/trips/:id` | ✔ | 200 `{ trip }` (inputs locked once `ready`) |
| `DELETE /api/trips/:id` | ✔ | 200 `{ success }` |
| `POST /api/trips/:id/generate` | ✔ | 200 `{ trip }` (status `ready`) |
| `POST /api/trips/:id/days/:day/regenerate` | ✔ | 200 `{ trip }` |
| `POST /api/trips/:id/days/:day/activities` | ✔ | 201 `{ trip }` |
| `DELETE /api/trips/:id/days/:day/activities/:activityId` | ✔ | 200 `{ trip }` |
| `POST /api/trips/:id/share` | ✔ | 200 `{ token }` |
| `DELETE /api/trips/:id/share` | ✔ | 200 `{ success }` |
| `GET /api/share/:token` | — | 200 `{ trip }` (sanitized, rate-limited) |

## Authentication

- Passwords hashed with **bcrypt (cost 12)**; registration de-duplicates emails (case-insensitive).
- Session is a **JWT in an httpOnly, SameSite=None, Secure cookie** — not readable by JS, safe from XSS.
- Failed login returns a single generic `401 INVALID_CREDENTIALS` for unknown email **and** wrong
  password (no account enumeration).
- **Ownership is enforced at the data layer**: a user querying another user's trip gets `404`,
  indistinguishable from a missing trip.
- Cross-origin: the cookie uses `SameSite=None; Secure` and CORS allows credentials only from
  `CLIENT_ORIGIN`. The frontend sends requests with `credentials: "include"`.

## AI Itinerary Generation

`FailoverLlmService` wraps two interchangeable `LlmProvider` implementations behind one
interface:

1. **Gemini** (primary) — native structured JSON via `responseSchema`.
2. **Groq** (fallback) — JSON mode.

`attempt<T>` tries providers in order; on failure it logs and falls through to the next. Every
request records which provider served it (`servedBy`) plus `durationMs`. If all providers fail,
the client receives a typed `502 LLM_UNAVAILABLE`.

**Trust rules:**
- The model output is validated against a **zod contract**; budget totals are **computed server-side**,
  and activity IDs are regenerated server-side — the LLM never controls identifiers or math.
- Generation uses an **atomic status claim**: `draft → generating → ready | failed`. A concurrent
  request can't double-generate, and a failed trip is retryable.
- **Inputs lock at `ready`** — destination/days/budget/interests can't be edited after generation
  (title stays editable). Day regeneration is instruction-driven and leaves other days untouched.

## Trip Sharing

- `POST /api/trips/:id/share` mints a **192-bit base64url capability token** stored on the trip.
  Re-sharing returns the **same token** (idempotent); revoking unsets it instantly.
- The public `GET /api/share/:token` returns a **sanitized projection** — `user`, `status`, and
  `shareToken` are never sent; the owner is reduced to a first name.
- The public endpoint is **rate-limited** (30 req/min) via `express-rate-limit` to prevent scraping.

## Deployment

| App | Platform | Build | Start | Notes |
|---|---|---|---|---|
| `server/` | Render (Web Service) | `npm install && npm run build` | `npm start` | Set `NODE_ENV=production`, `CLIENT_ORIGIN=https://<vercel-url>`, DB + API keys |
| `client/` | Vercel | `next build` | `next start` | Set `NEXT_PUBLIC_API_URL=https://<render-url>` |

After deploying the client, point Render's `CLIENT_ORIGIN` at the Vercel URL and redeploy.
Enable **Auto-Deploy** on both so pushes trigger builds. `NODE_ENV=production` also turns on
`trust proxy` (correct client IPs for rate limiting) and `Secure` cookies.

## Design Decisions & Trade-offs

- **Cross-origin cookie auth** — chosen over a bearer-only SPA flow because it keeps tokens out of
  JS memory (XSS-safe). It requires `SameSite=None; Secure` and CORS-with-credentials, which is the
  standard pattern for separated front/back domains.
- **Plaintext share token** (not a hash) — stored so re-share can return the *same* token (Google-Docs
  capability-link model). Tradeoff: a leaked token can't be matched back to a user, and revocation is
  a single-field unset.
- **Budget is static after generation** — editing activities doesn't re-run cost estimation; this keeps
  the UX predictable and avoids extra LLM calls.
- **Day regeneration sees only its own day** — avoids re-planning the whole trip, but may mildly overlap
  neighbouring days' sights.

## Limitations

- **Model availability** — free-tier model names change; both providers are env-configurable
  (`GEMINI_MODEL`, `GROQ_MODEL`) so swaps need no code change.
- **Budget not re-estimated on activity edits** — add/remove tweaks the plan but not the total.
- **Regeneration scope** — a regenerated day is planned in isolation, so it may repeat an attraction
  from an adjacent day.

## Responsible AI Use

- **Reliability** — automatic provider failover means a single vendor outage doesn't break the app.
- **Safety** — structured output + server-side zod validation guarantee the UI only ever renders
  well-typed data; the LLM cannot inject arbitrary fields, IDs, or math.
- **Privacy** — only the trip inputs you type (destination, days, budget, interests) leave the app to
  call the models; no account PII is included in prompts.
