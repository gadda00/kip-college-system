'use client'

/**
 * Thin fetch wrapper for the KIP College API.
 * All endpoints return { ok: true, data } | { ok: false, error }.
 * This helper unwraps the envelope and throws Error(message) on failure,
 * returning body.data as T on success.
 */

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, { credentials: 'same-origin', ...init })
  } catch {
    throw new Error('Network error — please check your connection and try again')
  }

  let body: ApiEnvelope<T> | null = null
  try {
    body = (await res.json()) as ApiEnvelope<T>
  } catch {
    // non-JSON response (e.g. HTML error page)
  }

  if (!res.ok || !body || body.ok === false) {
    const message =
      body && body.ok === false ? body.error : `Request failed (${res.status || 'network'})`
    throw new Error(message)
  }
  return body.data
}

/** GET a JSON API endpoint. */
export function api<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, init)
}

/** POST a JSON body. */
export function post<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...init,
  })
}

/** PATCH a JSON body. */
export function patch<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...init,
  })
}

/** DELETE a resource. */
export function del<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { method: 'DELETE', ...init })
}
