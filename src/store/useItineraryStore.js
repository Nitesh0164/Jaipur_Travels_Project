import { create } from 'zustand'

export const useItineraryStore = create((set) => ({
  preferences: null,
  itinerary: null,
  budgetBreakdown: null,
  loading: false,
  error: null,

  setPreferences: (preferences) =>
    set({ preferences }),

  setGeneratedTrip: ({ itinerary, budgetBreakdown, preferences }) =>
    set({
      itinerary,
      budgetBreakdown,
      preferences,
      loading: false,
      error: null,
    }),

  setItinerary: (itinerary) =>
    set({
      itinerary,
      loading: false,
      error: null,
    }),

  setLoading: (loading) => set({ loading }),

  setError: (error) =>
    set({
      error,
      loading: false,
    }),

  clear: () =>
    set({
      preferences: null,
      itinerary: null,
      budgetBreakdown: null,
      error: null,
      loading: false,
    }),
}))