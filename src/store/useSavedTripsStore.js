import { create } from 'zustand'
import { MOCK_SAVED_TRIPS } from '../data/mockSavedTrips'
const load = () => { try { const s=localStorage.getItem('cj_trips'); return s?JSON.parse(s):MOCK_SAVED_TRIPS } catch { return MOCK_SAVED_TRIPS } }
const save = (t) => { try { localStorage.setItem('cj_trips',JSON.stringify(t)) } catch {} }
export const useSavedTripsStore = create((set, get) => ({
  trips: load(),
  saveTrip: (trip) => {
    const t = { ...trip, id:`s_${Date.now()}`, savedAt:new Date().toISOString() }
    const updated = [t,...get().trips]
    save(updated); set({ trips:updated }); return t
  },
  deleteTrip: (id) => {
    const updated = get().trips.filter(t=>t.id!==id)
    save(updated); set({ trips:updated })
  },
  isSaved: (id) => get().trips.some(t=>t.id===id),
}))
