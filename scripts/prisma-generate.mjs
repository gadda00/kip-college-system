#!/usr/bin/env node
/**
 * Conditional Prisma client generation.
 *
 * The project ships two schemas:
 *   - prisma/schema.prisma          → PostgreSQL (production: Vercel + Prisma Postgres)
 *   - prisma/schema.sqlite.prisma   → SQLite     (local development)
 *
 * The correct one is chosen from DATABASE_URL so the generated client's query
 * engine always matches the runtime database. Run automatically via
 * `postinstall` and before every `build`.
 */
import { existsSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

function readEnvUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL.trim()
  if (existsSync('.env')) {
    const match = readFileSync('.env', 'utf8').match(/^\s*DATABASE_URL\s*=\s*(.+)$/m)
    if (match) return match[1].trim().replace(/^["']|["']$/g, '')
  }
  return ''
}

const url = readEnvUrl()
const schema = url.startsWith('file:') ? 'prisma/schema.sqlite.prisma' : 'prisma/schema.prisma'
const masked = url
  ? url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@').slice(0, 80)
  : '(unset → PostgreSQL schema)'

console.log(`[prisma-generate] schema=${schema} url=${masked}`)
execSync(`npx prisma generate --schema ${schema}`, { stdio: 'inherit' })
