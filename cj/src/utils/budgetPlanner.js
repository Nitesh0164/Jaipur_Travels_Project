import { MOCK_PLACES } from '../data/mockPlaces'

const CATEGORY_MAP = {
  heritage: ['Heritage'],
  food: ['Food', 'Cafes'],
  cafes: ['Cafes'],
  shopping: ['Shopping'],
  hiddenGems: ['Hidden Gems'],
  'hidden gems': ['Hidden Gems'],
  photography: ['Heritage', 'Hidden Gems', 'Shopping'],
}

function getPlaceVisitCost(place) {
  const category = String(place.category || '').toLowerCase()

  if (category === 'food') return place.estimatedSpend ?? 150
  if (category === 'cafes') return place.estimatedSpend ?? 250
  if (category === 'shopping') return place.estimatedSpend ?? 300

  return Number(place.entryFee || 0)
}

function normalizeInterest(value) {
  return String(value || '').trim().toLowerCase()
}

function getMatchingCategories(interests = []) {
  const categories = new Set()

  interests.forEach((interest) => {
    const key = normalizeInterest(interest)
    const mapped = CATEGORY_MAP[key]
    if (mapped) mapped.forEach((c) => categories.add(c))
  })

  return categories
}

export function calculateBudgetBreakdown(preferences) {
  const totalBudget = Number(preferences?.budget || 0)
  const days = Math.max(1, Number(preferences?.days || 1))
  const stayPreference = String(preferences?.stayPreference || 'budget').toLowerCase()

  let stayPct = 0.35
  let foodPct = 0.25
  let travelPct = 0.15
  let ticketsPct = 0.20

  if (stayPreference === 'mid-range' || stayPreference === 'midrange') {
    stayPct = 0.45
    foodPct = 0.20
    travelPct = 0.15
    ticketsPct = 0.15
  }

  if (stayPreference === 'premium') {
    stayPct = 0.55
    foodPct = 0.20
    travelPct = 0.15
    ticketsPct = 0.05
  }

  const stay = Math.round(totalBudget * stayPct)
  const food = Math.round(totalBudget * foodPct)
  const travel = Math.round(totalBudget * travelPct)
  const tickets = Math.round(totalBudget * ticketsPct)
  const misc = Math.max(totalBudget - (stay + food + travel + tickets), 0)

  return {
    totalBudget,
    days,
    stay,
    food,
    travel,
    tickets,
    misc,
    perDayBudget: Math.floor(totalBudget / days),
    perDayFood: Math.floor(food / days),
    perDayTravel: Math.floor(travel / days),
    perDayTickets: Math.floor(tickets / days),
  }
}

function pickAffordablePlaces(preferences, breakdown) {
  const selectedCategories = getMatchingCategories(preferences?.interests || [])

  let pool = [...MOCK_PLACES]

  if (selectedCategories.size > 0) {
    pool = pool.filter((place) => selectedCategories.has(place.category))
  }

  pool.sort((a, b) => {
    const aCost = getPlaceVisitCost(a)
    const bCost = getPlaceVisitCost(b)
    return aCost - bCost
  })

  return pool.filter((place) => getPlaceVisitCost(place) <= breakdown.perDayBudget)
}

function buildPeriodsFromPlaces(dayPlaces) {
  const slots = ['Morning', 'Afternoon', 'Evening']
  const icons = ['☀️', '🌤️', '🌇']

  return dayPlaces.map((place, index) => ({
    period: slots[index] || `Stop ${index + 1}`,
    icon: icons[index] || '📍',
    items: [
      {
        id: `${place.id}-${index}`,
        time: index === 0 ? '9:00 AM' : index === 1 ? '1:00 PM' : '5:00 PM',
        place: place.name,
        placeId: place.id,
        category: place.category,
        cost: getPlaceVisitCost(place),
        duration: place.duration,
        note: place.shortDesc,
        highlight: !!place.mustSee,
      },
    ],
  }))
}

export function buildBudgetFriendlyItinerary(preferences) {
  const breakdown = calculateBudgetBreakdown(preferences)
  const affordablePlaces = pickAffordablePlaces(preferences, breakdown)

  const days = breakdown.days
  const placesPerDay = 3
  const requiredPlaces = days * placesPerDay
  const selected = affordablePlaces.slice(0, requiredPlaces)

  const tripDays = []
  let totalActivityCost = 0

  for (let i = 0; i < days; i++) {
    const dayPlaces = selected.slice(i * placesPerDay, i * placesPerDay + placesPerDay)

    const activityCost = dayPlaces.reduce(
      (sum, place) => sum + getPlaceVisitCost(place),
      0
    )

    totalActivityCost += activityCost

    const estimatedDayCost =
      activityCost + breakdown.perDayFood + breakdown.perDayTravel

    tripDays.push({
      dayNumber: i + 1,
      label: `Day ${i + 1}`,
      theme: i === 0 ? 'Old Jaipur Highlights' : 'Jaipur Explorer Trail',
      periods: buildPeriodsFromPlaces(dayPlaces),
      estimatedCost: estimatedDayCost,
    })
  }

  const estimatedTotal =
    breakdown.stay +
    breakdown.food +
    breakdown.travel +
    totalActivityCost +
    breakdown.misc

  const clampedTotal = Math.min(estimatedTotal, breakdown.totalBudget)
  const remaining = Math.max(breakdown.totalBudget - clampedTotal, 0)

  const itinerary = {
    tripId: `trip_${Date.now()}`,
    city: String(preferences?.city || 'jaipur').toLowerCase(),
    title: `${days}-Day Jaipur Budget Itinerary`,
    summary: `A budget-friendly Jaipur trip tailored for ${days} day${days > 1 ? 's' : ''}, designed to stay within ₹${breakdown.totalBudget}.`,
    generatedAt: new Date().toISOString(),
    days: tripDays,
    budget: {
      stay: breakdown.stay,
      food: breakdown.food,
      travel: breakdown.travel,
      activities: totalActivityCost,
      misc: breakdown.misc,
    },
    totalCost: clampedTotal,
    remaining,
    tips: [
      'Start early to avoid crowds and heat.',
      'Use local transport or shared rides to reduce travel cost.',
      'Prioritise free and low-entry monuments for tighter budgets.',
      'Keep some budget buffer for snacks and local purchases.',
    ],
  }

  return {
    itinerary,
    budgetBreakdown: {
      ...breakdown,
      activitiesUsed: totalActivityCost,
      estimatedTotal: clampedTotal,
      remaining,
    },
  }
}