// Heuristic budget breakdown — replace with backend calculation when ready
export const calcBudgetBreakdown = ({ budget, days, stay, transport }) => {
  const stayPct   = stay?.includes('Luxury') ? 0.45 : stay?.includes('Heritage') ? 0.38 : stay?.includes('Budget') ? 0.22 : 0.32
  const travelPct = transport?.includes('Private') ? 0.20 : transport?.includes('Bike') ? 0.10 : 0.16
  const foodPct   = 0.28
  const ticketPct = 0.14
  const miscPct   = 1 - stayPct - travelPct - foodPct - ticketPct

  const total = budget * days
  return {
    stay:    Math.round(total * stayPct),
    food:    Math.round(total * foodPct),
    travel:  Math.round(total * travelPct),
    tickets: Math.round(total * ticketPct),
    misc:    Math.round(total * miscPct),
    total,
  }
}

export const BUDGET_COLORS = {
  stay:    { bg:'bg-primary/10',   text:'text-primary',   bar:'bg-primary'   },
  food:    { bg:'bg-secondary/10', text:'text-secondary',  bar:'bg-secondary'  },
  travel:  { bg:'bg-accent/10',    text:'text-accent',    bar:'bg-accent'    },
  tickets: { bg:'bg-violet-100',   text:'text-violet-600', bar:'bg-violet-400' },
  misc:    { bg:'bg-gray-100',     text:'text-gray-500',  bar:'bg-gray-400'  },
}

export const BUDGET_ICONS = { stay:'🏨', food:'🍴', travel:'🚗', tickets:'🎫', misc:'🛍️' }
export const BUDGET_LABELS = { stay:'Accommodation', food:'Food & Drinks', travel:'Transport', tickets:'Entry Tickets', misc:'Shopping & Misc' }
