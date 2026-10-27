# Deployment Guide

Three deployment paths, from fastest to most robust.

---

## Option A — Vercel (demo mode, ~3 minutes)

1. Click the **Deploy with Vercel** button in the README (or fork the repo and import it at [vercel.com/new](https://vercel.com/new)).
2. When prompted for the `DATABASE_URL` environment variable, enter:

   ```
   DATABASE_URL=file:/tmp/custom.db
   ```

3. Deploy. The bundled `src/instrumentation.ts` copies the seeded SQLite database to the serverless function's writable `/tmp` storage on cold start, so the site, portals and demo accounts all work.

**Demo-mode caveat:** writes (sign-in sessions, new applications, payments) live in the function's ephemeral storage. When the serverless instance recycles, that data resets — users simply sign in again. This is fine for evaluation and demos.

### Deploying with the Vercel CLI instead

```bash
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL production    # value: file:/tmp/custom.db
vercel --prod
```

---

## Option B — Netlify (demo mode)

1. Click the **Deploy to Netlify** button in the README (or import the repo at [app.netlify.com](https://app.netlify.com)).
2. Netlify auto-detects Next.js and uses the build command from `netlify.toml`.
3. Add the environment variable in **Site settings → Environment variables**:

   ```
   DATABASE_URL=file:/tmp/custom.db
   ```

4. Deploy. The same `/tmp` demo-mode behaviour as Vercel applies.

---

## Option C — Production with PostgreSQL (~10 minutes, recommended)

For persistent data — real admissions, real payments, real sessions — switch the database to a managed PostgreSQL service. [Neon](https://neon.tech) and [Supabase](https://supabase.com) both offer free tiers that comfortably run a college of this size.

### 1. Create the database

Create a project on Neon (or Supabase) and copy its connection string, e.g.:

```
postgresql://user:password@ep-xxxx.region.aws.neon.tech/kip_college?sslmode=require
```

### 2. Switch the Prisma provider

In `prisma/schema.prisma`, change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"      // was "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Point the app at Postgres

Set the environment variable everywhere the app runs (local `.env`, Vercel/Netlify project settings):

```
DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/kip_college?sslmode=require
```

### 4. Create the schema and load demo data

```bash
bunx prisma db push        # creates all tables in Postgres
bun prisma/seed.ts         # loads the demo dataset (optional but recommended)
bunx prisma generate       # regenerates the client for postgresql
```

### 5. Redeploy

```bash
vercel --prod          # or trigger a fresh Netlify deploy
```

All features — sessions, admissions, fee payments, results, exports — are now fully persistent.

---

## Custom domain

1. In Vercel/Netlify project settings, add your domain (e.g. `kipskitui.com`).
2. Follow the DNS instructions (an `A` record / `CNAME` pointing at the platform).
3. HTTPS certificates are provisioned automatically.

## Environment variables reference

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | Database connection (SQLite file or Postgres URL) | `file:/tmp/custom.db` or a `postgresql://` URL |

Optional: the AI assistant endpoints (public assistant and student Study Buddy) use a server-side LLM SDK; without credentials they return a friendly fallback reply, and every other feature is unaffected.
