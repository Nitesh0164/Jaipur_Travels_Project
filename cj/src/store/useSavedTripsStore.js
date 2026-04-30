import { create } from 'zustand'
import { get, post, del } from '../lib/api'

/**
 * Saved trips store — uses authenticated /api/trips endpoints.
 * Falls back gracefully if the user is not logged in.
 *
 * Backend DTOs:
 *   GET    /api/trips       → TripSummaryResponse[]
 *   POST   /api/trips       → TripResponse (CreateTripRequest body)
 *   GET    /api/trips/{id}  → TripResponse (full detail with itineraryJson)
 *   DELETE /api/trips/{id}  → void
 */
export const useSavedTripsStore = create((set, get_) => ({
  trips: [],
  loading: false,
  error: null,
  fetched: false,

  /**
   * GET /api/trips → TripSummaryResponse[]
   * Maps to the card shape the UI expects.
   */
  fetchTrips: async () => {
    if (get_().fetched) return
    set({ loading: true, error: null })
    try {
      const data = await get('/api/trips')
      const mapped = (data ?? []).map(mapTripSummary)
      set({ trips: mapped, loading: false, fetched: true })
    } catch (err) {
      console.error('[Trips] fetch failed:', err.message)
      set({ loading: false, error: err.message })
    }
  },

  /**
   * POST /api/trips → TripResponse
   * Body: CreateTripRequest
   */
  saveTrip: async (trip) => {
    try {
      const body = {
        title: trip.title || 'Jaipur Trip',
        city: trip.city || 'Jaipur',
        days: Number(trip.days) || 1,
        budget: Number(trip.budget) || 0,
        travelStyle: trip.travelStyle || 'family',
        groupType: trip.groupType || trip.travelStyle || 'family',
        interests: trip.interests || [],
        summary: trip.summary || '',
        totalCost: Number(trip.totalCost) || Number(trip.budget) || 0,
        itineraryJson: trip.itineraryJson || (trip._raw ? JSON.stringify(trip._raw) : ''),
        notes: trip.notes || '',
      }
      const created = await post('/api/trips', body)
      const mapped = mapTripSummary(created)
      set((s) => ({ trips: [mapped, ...s.trips] }))
      return mapped
    } catch (err) {
      console.error('[Trips] save failed:', err.message)
      // Fallback: save locally
      const local = {
        ...trip,
        id: `local_${Date.now()}`,
        savedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        _local: true,
      }
      set((s) => ({ trips: [local, ...s.trips] }))
      return local
    }
  },

  /**
   * DELETE /api/trips/{id}
   */
  deleteTrip: async (id) => {
    // Optimistic delete
    const prev = get_().trips
    set((s) => ({ trips: s.trips.filter((t) => String(t.id) !== String(id)) }))
    try {
      // Only call API for server-side trips (not local fallbacks)
      if (!String(id).startsWith('local_')) {
        await del(`/api/trips/${id}`)
      }
    } catch (err) {
      // Rollback on failure
      set({ trips: prev })
      console.error('[Trips] delete failed:', err.message)
    }
  },

  /**
   * GET /api/trips/{id} → TripResponse (with itineraryJson)
   */
  loadTrip: async (id) => {
    try {
      const data = await get(`/api/trips/${id}`)
      return data
    } catch (err) {
      console.error('[Trips] load failed:', err.message)
      return null
    }
  },

  isSaved: (id) => get_().trips.some((t) => String(t.id) === String(id)),

  clearTrips: () => set({ trips: [], fetched: false, error: null }),
}))

/* ── shape mapper: TripSummaryResponse / TripResponse → UI card shape ── */
function mapTripSummary(t) {
  if (!t) return t
  return {
    id: t.id,
    title: t.title || 'Untitled Trip',
    city: t.city || 'Jaipur',
    days: t.days || 1,
    budget: Number(t.totalCost ?? t.budget ?? 0),
    travelStyle: t.travelStyle || 'family',
    interests: t.interests || [],
    summary: t.summary || '',
    emoji: '🏰',
    bg: 'from-amber-100 to-orange-200',
    savedAt: t.createdAt || new Date().toISOString(),
    createdAt: t.createdAt,
    // Carry forward for detailed view
    itineraryJson: t.itineraryJson,
    notes: t.notes,
  }
}
