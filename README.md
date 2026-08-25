# AI Travel Planner

Generate complete day-by-day travel itineraries with an LLM agent — including budget estimation and hotel suggestions. Users register, describe their trip (destination, days, budget level, interests), and receive an editable plan powered by Google Gemini with automatic Groq failover.

> **Status:** work in progress.

## Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (via Mongoose)
- **Language:** TypeScript throughout
- **AI:** Google Gemini (primary) → Groq (fallback)

## Structure

```
client/   # Next.js frontend
server/   # Express API
```

Full setup instructions will land here as the project takes shape.
