# Deploy BattleBros to Railway

Pull the `working` branch — it has all latest changes (security fixes, Groq LLM, Docker, prototype).

## 1. Pull

```bash
git fetch origin
git checkout working
git pull origin working
```

## 2. Environment Variables (set in Railway dashboard)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Provided by Railway Postgres plugin |
| `GROQ_API_KEY` | Ask dad for the key |
| `SESSION_SECRET` | Generate: `openssl rand -hex 32` |
| `CRON_SECRET` | Generate: `openssl rand -hex 32` |
| `LLM_MODEL` | `llama-3.3-70b-versatile` (optional, is default) |

## 3. Railway Build Settings

- **Build command:** `pnpm install && cp -r prototype/ public/prototype/ && pnpm exec prisma generate && pnpm build`
- **Start command:** `pnpm exec prisma db push && pnpm exec next start`

## 4. Seed the Database

After first deploy, run in Railway shell:

```bash
pnpm exec prisma db push
pnpm exec tsx prisma/seed.ts
```

Creates 10 fighters (passwords are `{name}-pwd`, e.g. `murph-pwd`), 6 venues, 8 weapons.

## 5. Verify

- Login page at root URL
- Prototype at `/prototype/BattleBros.html`
