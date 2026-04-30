import { MOCK_ITINERARY } from './mockItinerary'

export const INITIAL_MESSAGES = [
  {
    id: 'msg-welcome',
    role: 'ai',
    type: 'text',
    text: 'नमस्ते! 🙏 I\'m your AI trip planner for Jaipur. Tell me your budget, number of days, and travel style — or ask me about the weather, best places to visit in the morning, or top bars in the city!',
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
  { id:'bars',     label:'🍸 Best bars & nightlife',  prompt:'What are the best bars and nightlife spots in Jaipur?' },
  { id:'family',   label:'👨‍👩‍👧 More family-friendly',  prompt:'Adjust for young children — remove difficult climbs, add kid-friendly activities.' },
  { id:'weather',  label:'🌧️ Rainy season plan',       prompt:'What are the best places to visit during the rainy season?' },
  { id:'budget',   label:'📊 Show budget breakdown',   prompt:'Give me a detailed cost breakdown with tips to save money.' },
]

export const QUICK_PROMPTS = [
  'Best street food near Hawa Mahal?',
  'Top bars and nightlife in Jaipur?',
  'Where should I go in the morning?',
  'Places to visit in the winter?',
  'What to do in the rainy season?',
]
