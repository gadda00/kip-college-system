import { db } from '@/lib/db'

/**
 * Append-only audit trail for security-relevant actions.
 * Never throws — an audit failure must not break the user's operation,
 * but it IS logged to stderr for operators.
 */
export async function logAudit(entry: {
  actorId?: string | null
  actorEmail?: string | null
  action: string
  entity?: string | null
  entityId?: string | null
  meta?: Record<string, unknown> | null
  ip?: string | null
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actorEmail: entry.actorEmail ?? null,
        action: entry.action,
        entity: entry.entity ?? null,
        entityId: entry.entityId ?? null,
        meta: entry.meta ? JSON.stringify(entry.meta).slice(0, 4000) : null,
        ip: entry.ip ?? null,
      },
    })
  } catch (err) {
    console.error('[audit] failed to persist entry:', entry.action, err)
  }
}
