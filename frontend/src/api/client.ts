import type { ApiErrorBody } from './types'

const SESSION_KEY = 'lampochki.sessionId'

export const CATALOG_BASE_URL =
  import.meta.env.VITE_CATALOG_URL?.replace(/\/$/, '') ?? 'http://localhost:3001'
export const ORDERS_BASE_URL =
  import.meta.env.VITE_ORDERS_URL?.replace(/\/$/, '') ?? 'http://localhost:3002'

const generateSessionId = (): string => {
  const cryptoObj = (globalThis as { crypto?: Crypto }).crypto
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID()
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'ssr'
  let id = window.localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = generateSessionId()
    window.localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export class ApiError extends Error {
  status: number
  body: ApiErrorBody | string | null

  constructor(message: string, status: number, body: ApiErrorBody | string | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  withSession?: boolean
}

const buildUrl = (base: string, path: string, query?: Record<string, unknown>): string => {
  const url = new URL(base + path, window.location.origin)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

const parseBody = async (resp: Response): Promise<unknown> => {
  if (resp.status === 204) return null
  const text = await resp.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const request = async <T>(
  base: string,
  path: string,
  { method = 'GET', body, signal, withSession = false }: RequestOptions = {},
  query?: Record<string, unknown>,
): Promise<T> => {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (withSession) headers['X-Session-ID'] = getSessionId()

  const resp = await fetch(buildUrl(base, path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  if (!resp.ok) {
    const errBody = (await parseBody(resp)) as ApiErrorBody | string | null
    const msg =
      typeof errBody === 'string'
        ? errBody
        : errBody?.error ?? `Request failed with ${resp.status}`
    throw new ApiError(msg, resp.status, errBody)
  }

  return (await parseBody(resp)) as T
}

export const catalogApi = {
  get: <T>(path: string, query?: Record<string, unknown>, signal?: AbortSignal) =>
    request<T>(CATALOG_BASE_URL, path, { signal }, query),
}

export const ordersApi = {
  get: <T>(path: string, query?: Record<string, unknown>, signal?: AbortSignal) =>
    request<T>(ORDERS_BASE_URL, path, { signal, withSession: true }, query),
  post: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>(ORDERS_BASE_URL, path, { method: 'POST', body, signal, withSession: true }),
  patch: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>(ORDERS_BASE_URL, path, { method: 'PATCH', body, signal, withSession: true }),
  delete: <T>(path: string, signal?: AbortSignal) =>
    request<T>(ORDERS_BASE_URL, path, { method: 'DELETE', signal, withSession: true }),
}
