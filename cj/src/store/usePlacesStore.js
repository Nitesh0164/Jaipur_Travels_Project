import { create } from 'zustand'
import { get, post, put, del } from '../lib/api'

/**
 * Places store — fetches from GET /api/places.
 * Backend PlaceResponse field `reviewCount` is mapped to `reviews` for UI compat.
 * Mock data files are NOT deleted — they serve as offline fallback.
 */
export const usePlacesStore = create((set, get_) => ({
  places: [],
  loading: false,
  error: null,
  fetched: false,

  /**
   * GET /api/places → PlaceResponse[]
   * Maps reviewCount → reviews for backward compat with UI components.
   */
  fetchPlaces: async () => {
    if (get_().fetched && get_().places.length > 0) return // cache hit
    set({ loading: true, error: null })
    try {
      const data = await get('/api/places', { auth: false })
      const mapped = (data ?? []).map(mapPlace)
      set({ places: mapped, loading: false, fetched: true })
    } catch (err) {
      console.error('[Places] fetch failed, falling back to empty:', err.message)
      set({ loading: false, error: err.message })
    }
  },

  /* ── Admin CRUD (optional, lower priority) ── */

  addPlace: async (place) => {
    try {
      const created = await post('/api/admin/places', place)
      set((s) => ({ places: [mapPlace(created), ...s.places] }))
      return { success: true, place: created }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },

  updatePlace: async (id, updates) => {
    try {
      const updated = await put(`/api/admin/places/${id}`, updates)
      set((s) => ({
        places: s.places.map((p) => (p.id === id ? mapPlace(updated) : p)),
      }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },

  deletePlace: async (id) => {
    try {
      await del(`/api/admin/places/${id}`)
      set((s) => ({ places: s.places.filter((p) => p.id !== id) }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },

  /* ── Local selectors (unchanged) ── */

  getPlaceById: (id) => {
    return get_().places.find((place) => String(place.id) === String(id))
  },

  getPlacesByCategory: (category) => {
    return get_().places.filter(
      (place) =>
        String(place.category).toLowerCase() ===
        String(category).toLowerCase()
    )
  },

  resetPlaces: () => {
    set({ places: [], fetched: false, error: null })
  },
}))

/* ── shape mapper: backend → frontend ── */
function mapPlace(p) {
  if (!p) return p
  return {
    ...p,
    // Backend sends `reviewCount`, UI expects `reviews`
    reviews: p.reviewCount ?? p.reviews ?? 0,
    // Ensure numeric types
    entryFee: Number(p.entryFee ?? 0),
    estimatedSpend: Number(p.estimatedSpend ?? 0),
    rating: Number(p.rating ?? 0),
  }
}