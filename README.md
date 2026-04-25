# BattleBros

A Claude-powered head-to-head fight simulator for a friend group of 10. Pick two friends, spin the slot machine for venue, weapons, and drunkenness, and watch Claude stream a dramatic play-by-play that ends in a verdict card.

The whole character profile for each fighter — signature moves, win condition, signature weapon, home venue — emerges from short trait tags submitted by the group. Day 1 nobody is fightable; the only way to unlock fighters is to contribute traits.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind 4
- **Postgres** via Prisma 7 with the `@prisma/adapter-pg` driver adapter
- **Anthropic SDK** for the sanity gate, profile derivation, probability compute, and narration
- **jose** for cookie-signed session JWTs

## Local setup

```bash
pnpm install
cp .env.example .env
# Edit .env: DATABASE_URL, SESSION_SECRET, ANTHROPIC_API_KEY
pnpm db:migrate:dev   # runs the initial migration
pnpm db:seed          # seeds 10 friend rows + day-1 libraries
pnpm dev
```

Then open http://localhost:3000 and log in as one of the seeded friends.

### Custom roster

Drop a `roster.seed.json` next to `package.json` to override the default seed:

```json
[
  { "name": "Alice", "password": "alice-pwd" },
  { "name": "Bob",   "password": "bob-pwd" }
]
```

The file is gitignored — passwords stay on your machine.

## Project layout

- `app/` — Next.js App Router routes (login, roster, fight, API).
- `lib/` — Prisma client, Anthropic client, session helpers, day-1 libraries.
- `components/` — React UI components.
- `prisma/` — schema + seed script.

See `~/.claude/plans/i-have-an-idea-mighty-sun.md` for the full product plan.
