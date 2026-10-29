/**
 * Server bootstrap — runs once per server instance (including serverless
 * cold starts on Vercel / Netlify).
 *
 * Demo-mode SQLite bootstrap: when DATABASE_URL points at the serverless
 * function's writable /tmp storage, copy the bundled seeded database there
 * so the entire platform (pages, portals, demo accounts) works out of the
 * box without a managed database service.
 *
 * Local development and production Postgres deployments are unaffected.
 *
 * The node-only implementation lives in ./instrumentation-node and is
 * dynamically imported below ONLY for the Node.js runtime — the documented
 * Next.js pattern, so the Edge-variant compilation never follows the
 * `node:fs` / `node:path` imports (no edge-runtime warnings).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { bootstrapDemoDatabase } = await import('./instrumentation-node')
    await bootstrapDemoDatabase()
  }
}
