// store/useTripStore.js
import { create } from 'zustand'
import { getCityConfig } from '../data/cityConfig'

const defaults = {
  city:'jaipur', days:2, budget:5000, travelStyle:'Family',
  interests:['Heritage','Food'], stay:'Mid-range Hotel',
  transport:'Cab / Ola-Uber', pace:'Balanced (5–6 stops/day)',
}
export const useTripStore = create((set, get) => ({
  prefs: defaults,
  cityConfig: getCityConfig('jaipur'),
  setPrefs: (p) => set(s => ({ prefs: { ...s.prefs, ...p } })),
  toggleInterest: (i) => set(s => {
    const cur = s.prefs.interests
    return { prefs: { ...s.prefs, interests: cur.includes(i) ? cur.filter(x=>x!==i) : [...cur,i] } }
  }),
  reset: () => set({ prefs: defaults }),
}))
