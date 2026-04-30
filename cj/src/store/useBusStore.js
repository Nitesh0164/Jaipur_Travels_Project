import { create } from 'zustand'
import { get, post, put, del } from '../lib/api'

/**
 * Bus store — fetches from GET /api/buses/routes and POST /api/buses/plan-route.
 * Mock data files preserved as offline fallback.
 */
export const useBusStore = create((set, get_) => ({
  routes: [],
  networkInfo: {},
  loading: false,
  error: null,
  fetched: false,

  // Route plan result
  planResult: null,
  planLoading: false,
  planError: null,

  /**
   * GET /api/buses/routes → BusRouteResponse[]
   */
  fetchRoutes: async () => {
    if (get_().fetched && get_().routes.length > 0) return
    set({ loading: true, error: null })
    try {
      const data = await get('/api/buses/routes', { auth: false })
      const routes = (data ?? []).map(mapRoute)
      // Derive network info from routes
      const networkInfo = deriveNetworkInfo(routes)
      set({ routes, networkInfo, loading: false, fetched: true })
    } catch (err) {
      console.error('[BusStore] fetch failed:', err.message)
      set({ loading: false, error: err.message })
    }
  },

  /**
   * POST /api/buses/plan-route → RoutePlanResponse
   * Body: { source, destination }
   */
  planRoute: async (source, destination) => {
    set({ planLoading: true, planError: null, planResult: null })
    try {
      const data = await post(
        '/api/buses/plan-route',
        { source, destination },
        { auth: false }
      )
      set({ planResult: data, planLoading: false })
      return data
    } catch (err) {
      set({ planLoading: false, planError: err.message })
      return null
    }
  },

  clearPlanResult: () => set({ planResult: null, planError: null }),

  /* ── Admin CRUD ── */

  addRoute: async (route) => {
    try {
      const created = await post('/api/admin/buses', route)
      set((s) => ({ routes: [mapRoute(created), ...s.routes] }))
      return { success: true, route: created }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },

  updateRoute: async (id, updates) => {
    try {
      const updated = await put(`/api/admin/buses/${id}`, updates)
      set((s) => ({
        routes: s.routes.map((r) => (r.id === id ? mapRoute(updated) : r)),
      }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },

  deleteRoute: async (id) => {
    try {
      await del(`/api/admin/buses/${id}`)
      set((s) => ({ routes: s.routes.filter((r) => r.id !== id) }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },

  /* ── Local selectors ── */

  getRouteById: (id) => {
    return get_().routes.find((route) => String(route.id) === String(id))
  },

  getRoutesByCategory: (category) => {
    return get_().routes.filter(
      (route) =>
        String(route.category).toLowerCase() ===
        String(category).toLowerCase()
    )
  },

  resetRoutes: () => {
    set({ routes: [], networkInfo: {}, fetched: false, error: null })
  },
}))

/* ── shape mapper ── */
function mapRoute(r) {
  if (!r) return r
  return {
    ...r,
    distanceKm: Number(r.distanceKm ?? 0),
    stopsCount: Number(r.stopsCount ?? 0),
    headwayMinutes: Number(r.headwayMinutes ?? 0),
    busesOnRoute: Number(r.busesOnRoute ?? 0),
    fareMin: Number(r.fareMin ?? 0),
    fareMax: Number(r.fareMax ?? 0),
  }
}

/* ── derive network stats from routes ── */
function deriveNetworkInfo(routes) {
  return {
    totalRoutes: routes.length,
    totalBuses: routes.reduce((s, r) => s + (r.busesOnRoute || 0), 0),
    hours: '5:30 AM – 10:30 PM',
  }
}