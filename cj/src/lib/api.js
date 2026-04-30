/**
 * Central API client — auto-unwraps ApiResponse envelope,
 * attaches JWT Bearer token, and handles token refresh.
 *
 * Backend envelope: { success, message, data, timestamp }
 */

const BASE_URL = '' // Vite proxy handles /api → localhost:8081

/* ── helpers to read / write auth tokens ── */

function getTokens() {
  try {
    const raw = localStorage.getItem('complete-jaipur-auth')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    // Zustand persist wraps in { state: { ... } }
    const state = parsed?.state ?? parsed
    return {
      accessToken: state.accessToken ?? null,
      refreshToken: state.refreshToken ?? null,
    }
  } catch {
    return {}
  }
}

function setTokensInStore(accessToken, refreshToken) {
  try {
    const raw = localStorage.getItem('complete-jaipur-auth')
    if (!raw) return
    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed
    state.accessToken = accessToken
    state.refreshToken = refreshToken
    if (parsed?.state) {
      parsed.state = state
    }
    localStorage.setItem('complete-jaipur-auth', JSON.stringify(parsed))
  } catch {
    // best-effort
  }
}

/* ── token refresh logic ── */

let refreshPromise = null

async function refreshAccessToken() {
  const { refreshToken } = getTokens()
  if (!refreshToken) throw new Error('No refresh token available')

  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) {
      // Refresh failed — force logout
      clearAuthStorage()
      window.location.href = '/login'
      throw new Error('Session expired — please login again')
    }

    const json = await res.json()
    const data = json.data ?? json
    setTokensInStore(data.accessToken, data.refreshToken)
    return data.accessToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

function clearAuthStorage() {
  try {
    const raw = localStorage.getItem('complete-jaipur-auth')
    if (!raw) return
    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed
    state.accessToken = null
    state.refreshToken = null
    state.user = null
    state.isAuthenticated = false
    if (parsed?.state) parsed.state = state
    localStorage.setItem('complete-jaipur-auth', JSON.stringify(parsed))
  } catch {
    localStorage.removeItem('complete-jaipur-auth')
  }
}

/* ── core request function ── */

/**
 * @param {string} method
 * @param {string} path   e.g. '/api/places'
 * @param {object} [body]
 * @param {object} [opts]  extra options
 * @param {boolean} [opts.auth=true]  attach Authorization header
 * @param {boolean} [opts.raw=false]  return raw Response
 * @returns {Promise<any>}  unwrapped `data` field from ApiResponse
 */
async function request(method, path, body, opts = {}) {
  const { auth = true, raw = false } = opts

  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const { accessToken } = getTokens()
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })

  // 401 → try refresh once
  if (res.status === 401 && auth) {
    try {
      const newToken = await refreshAccessToken()
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
      })
    } catch {
      throw new ApiError('Session expired — please login again', 401)
    }
  }

  if (raw) return res

  const json = await res.json().catch(() => null)

  if (!res.ok || json?.success === false) {
    const msg =
      json?.message ||
      json?.error ||
      `Request failed (${res.status})`
    throw new ApiError(msg, res.status, json)
  }

  // Unwrap the ApiResponse envelope — return `data`
  return json?.data !== undefined ? json.data : json
}

/* ── public helpers ── */

export const get = (path, opts) => request('GET', path, null, opts)
export const post = (path, body, opts) => request('POST', path, body, opts)
export const put = (path, body, opts) => request('PUT', path, body, opts)
export const del = (path, opts) => request('DELETE', path, null, opts)

/* ── error class ── */

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export default { get, post, put, del, ApiError }
