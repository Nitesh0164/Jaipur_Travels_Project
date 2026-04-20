import { MOCK_ITINERARY } from './mockItinerary'

export const INITIAL_MESSAGES = [
  {
    id: 'msg-welcome',
    role: 'ai',
    type: 'text',
    text: 'नमस्ते! 🙏 I\'m your AI trip planner for Jaipur. Tell me your budget, number of days, and travel style — I\'ll craft a personalised day-wise itinerary with food, heritage, and hidden gems.',
    ts: new Date(Date.now() - 120000).toISOString(),
  },
]

export const MOCK_AI_REPLY = {
  id: 'msg-ai-1',
  role: 'ai',
  type: 'itinerary_card',
  text: 'Here\'s your personalised 2-day Jaipur itinerary for a family of 4! I\'ve balanced heritage, food, and hidden gems — all within ₹8,000. 🗺️',
  itinerary: MOCK_ITINERARY,
  ts: new Date().toISOString(),
}

export const SMART_CHIPS = [
  { id:'cheaper',  label:'💸 Make it cheaper',        prompt:'Can you make this itinerary cheaper with free or low-cost alternatives?' },
  { id:'cafes',    label:'☕ Add more cafes',          prompt:'Add more cafe and coffee shop stops to the itinerary.' },
  { id:'family',   label:'👨‍👩‍👧 More family-friendly',  prompt:'Adjust for young children — remove difficult climbs, add kid-friendly activities.' },
  { id:'travel',   label:'🚗 Reduce travel time',      prompt:'Reorganise to minimise travel distances between stops each day.' },
  { id:'hidden',   label:'💎 More hidden gems',        prompt:'Replace some popular spots with lesser-known hidden gems locals love.' },
  { id:'budget',   label:'📊 Show budget breakdown',   prompt:'Give me a detailed cost breakdown with tips to save money.' },
]

export const QUICK_PROMPTS = [
  'Best street food near Hawa Mahal?',
  'Suggest a rooftop restaurant for dinner',
  'How to get from Amber Fort to City Palace?',
  'Add a half-day to Jaigarh Fort',
  'What\'s the best time to visit in the year?',
]
