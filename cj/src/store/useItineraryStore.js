import { create } from 'zustand'
import { post } from '../lib/api'

/**
 * Itinerary store — generates itinerary via POST /api/planner/generate.
 *
 * Backend PlannerResponse shape:
 *   { title, city, days, summary, travelStyle, groupType, interests,
 *     estimatedBudget: { totalEstimatedCost, perDayCost, placesSpend, ... },
 *     dayPlans: [{ dayNumber, theme, estimatedDayCost, stops: [...], notes }],
 *     notes, transportSummary }
 *
 * Frontend ItineraryDayCard expects:
 *   day.periods[].items[] with { id, time, place, category, cost, duration, note, ... }
 *
 * We map dayPlans → days with periods to keep the existing UI components working.
 */
export const useItineraryStore = create((set) => ({
  preferences: null,
  itinerary: null,
  budgetBreakdown: null,
  loading: false,
  error: null,

  setPreferences: (preferences) =>
    set({ preferences }),

  /**
   * POST /api/planner/generate
   * Body: GeneratePlannerRequest { city, days, budget, interests, travelStyle, groupType }
   * Returns: PlannerResponse → mapped to frontend itinerary shape
   */
  generateItinerary: async (prefs) => {
    set({ loading: true, error: null })
    try {
      const data = await post('/api/planner/generate', {
        city: prefs.city || 'Jaipur',
        days: Number(prefs.days) || 2,
        budget: Number(prefs.budget) || 5000,
        interests: prefs.interests || [],
        travelStyle: prefs.travelStyle || 'family',
        groupType: prefs.groupType || prefs.travelStyle || 'family',
      })

      const mapped = mapPlannerResponse(data)
      set({
        itinerary: mapped.itinerary,
        budgetBreakdown: mapped.budgetBreakdown,
        preferences: prefs,
        loading: false,
        error: null,
      })
      return mapped
    } catch (err) {
      set({ loading: false, error: err.message })
      return null
    }
  },

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

/* ── Shape mapper: PlannerResponse → frontend itinerary shape ── */

const TIME_OF_DAY_MAP = {
  morning: { period: 'Morning', icon: '☀️', startHour: 7 },
  afternoon: { period: 'Afternoon', icon: '🌤️', startHour: 12 },
  evening: { period: 'Evening', icon: '🌇', startHour: 16 },
}

const DAY_EMOJIS = ['🏰', '🍴', '📸', '🌅', '🎨', '🛍️', '🎭', '🌿']

function mapPlannerResponse(data) {
  if (!data) return { itinerary: null, budgetBreakdown: null }

  const days = (data.dayPlans ?? []).map((dp, dayIdx) => {
    // Group stops by time-of-day into periods
    const periodGroups = { morning: [], afternoon: [], evening: [] }

    ;(dp.stops ?? []).forEach((stop, stopIdx) => {
      const tod = (stop.suggestedTimeOfDay || 'morning').toLowerCase()
      const bucket = periodGroups[tod] || periodGroups.morning

      bucket.push({
        id: `d${dp.dayNumber}_s${stopIdx}`,
        time: formatTime(tod, bucket.length),
        place: stop.placeName || stop.slug || 'Unknown',
        placeId: stop.slug || String(stop.placeId || ''),
        category: stop.category || 'General',
        cost: Number(stop.estimatedSpend ?? 0),
        duration: stop.duration || '1 hr',
        note: stop.tip || stop.transportHint || '',
        highlight: stopIdx === 0,
      })
    })

    const periods = Object.entries(periodGroups)
      .filter(([, items]) => items.length > 0)
      .map(([tod, items]) => ({
        period: TIME_OF_DAY_MAP[tod]?.period || 'Morning',
        icon: TIME_OF_DAY_MAP[tod]?.icon || '☀️',
        items,
      }))

    // If no periods (empty day), add a placeholder morning period
    if (periods.length === 0) {
      periods.push({ period: 'Morning', icon: '☀️', items: [] })
    }

    return {
      dayNumber: dp.dayNumber,
      label: `Day ${dp.dayNumber}`,
      theme: dp.theme || `Day ${dp.dayNumber}`,
      emoji: DAY_EMOJIS[(dayIdx) % DAY_EMOJIS.length],
      periods,
    }
  })

  // Budget mapping
  const eb = data.estimatedBudget ?? {}
  const totalCost = Number(eb.totalEstimatedCost ?? 0)
  const budgetBreakdown = {
    totalBudget: totalCost,
    estimatedTotal: totalCost,
    remaining: 0,
    stay: 0,
    food: Number(eb.foodSpend ?? 0),
    travel: Number(eb.transportSpend ?? 0),
    tickets: Number(eb.placesSpend ?? 0),
    misc: Number(eb.miscSpend ?? 0),
  }

  const itinerary = {
    title: data.title || `${data.days}-Day ${data.city || 'Jaipur'} Trip`,
    city: data.city || 'Jaipur',
    summary: data.summary || '',
    days,
    totalCost,
    budget: {
      stay: budgetBreakdown.stay,
      food: budgetBreakdown.food,
      travel: budgetBreakdown.travel,
      tickets: budgetBreakdown.tickets,
      misc: budgetBreakdown.misc,
    },
    tips: data.notes ?? [],
    // Keep the raw PlannerResponse for saving
    _raw: data,
  }

  return { itinerary, budgetBreakdown }
}

function formatTime(tod, index) {
  const base = TIME_OF_DAY_MAP[tod]?.startHour || 7
  const hour = base + index * 2 // 2-hour intervals
  const h12 = hour > 12 ? hour - 12 : hour
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${h12}:00 ${ampm}`
}