// Per-city configuration. Adding a new city = adding a key here.
// No component changes required — all components read from getCityConfig().
export const CITY_CONFIG = {
  jaipur: {
    slug:        'jaipur',
    displayName: 'Jaipur',
    tagline:     'The Pink City',
    currency:    'INR',
    symbol:      '₹',
    defaultDays: 2,
    categories:  ['Heritage','Food','Cafes','Shopping','Hidden Gems','Nature','Photography'],
    travelStyles:['Solo','Couple','Family','Friends Group','Corporate'],
    stayOptions: ['Budget Hostel','Guesthouse','Mid-range Hotel','Heritage Haveli','Luxury Resort'],
    transports:  ['Auto / Rickshaw','Cab / Ola-Uber','Rented Bike','Private Car','Public Bus'],
    paceOptions: ['Relaxed (3–4 stops/day)','Balanced (5–6 stops/day)','Fast-paced (7+ stops/day)'],
    prompts: [
      'Plan my 2-day Jaipur trip under ₹3,000',
      'Best cafes in Jaipur under ₹300',
      'Family Jaipur trip for 3 days',
      'Hidden gems in Jaipur for solo traveller',
      'Romantic Jaipur weekend under ₹8,000',
    ],
    budgetRanges: [
      { label: 'Budget',  min: 500,   max: 2000  },
      { label: 'Mid',     min: 2000,  max: 5000  },
      { label: 'Comfort', min: 5000,  max: 12000 },
      { label: 'Luxury',  min: 12000, max: 60000 },
    ],
  },
  // udaipur: { ... },  // Future — zero component changes needed
}

export const DEFAULT_CITY = 'jaipur'
export const getCityConfig = (slug = DEFAULT_CITY) =>
  CITY_CONFIG[slug] ?? CITY_CONFIG[DEFAULT_CITY]
