import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Star } from 'lucide-react'
import Badge from '../ui/Badge'
import { fmt } from '../../utils/formatCurrency'

// --- ItineraryItemRow ---
export function ItineraryItemRow({ item }) {
  return (
    <div className={`flex gap-4 py-3.5 border-b border-border last:border-0 group ${item.highlight ? 'bg-primary-lighter/40 -mx-4 px-4 rounded-xl' : ''}`}>
      {/* Time */}
      <div className="w-16 shrink-0 pt-0.5">
        <p className="text-xs font-bold text-primary">{item.time}</p>
        <p className="text-[10px] text-ink-faint mt-0.5">{item.duration}</p>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="font-semibold text-sm text-ink">{item.place}</p>
          {item.highlight && <Star size={12} className="text-primary fill-primary mt-0.5 shrink-0" />}
        </div>
        <p className="text-xs text-ink-muted mt-1 leading-relaxed">{item.note}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge label={item.category} />
        </div>
      </div>

      {/* Cost */}
      <div className="shrink-0 text-right pt-0.5">
        <p className={`text-sm font-bold ${item.cost === 0 ? 'text-accent' : 'text-ink'}`}>
          {item.cost === 0 ? 'Free' : fmt(item.cost)}
        </p>
      </div>
    </div>
  )
}

// --- ItineraryDayCard ---
export function ItineraryDayCard({ day }) {
  const [collapsed, setCollapsed] = useState(false)
  const allItems = day.periods.flatMap(p => p.items)
  const dayTotal = allItems.reduce((s, i) => s + i.cost, 0)

  return (
    <div className="card overflow-hidden">
      {/* Day header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-sand to-primary-lighter border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center text-lg">
            {day.emoji}
          </div>
          <div>
            <p className="font-bold text-ink text-sm">{day.label}</p>
            <p className="text-xs text-ink-muted">{day.theme}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-ink-faint">Est. spend</p>
            <p className="text-sm font-bold text-primary">{fmt(dayTotal)}</p>
          </div>
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/60 text-ink-muted transition-colors">
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Periods */}
      {!collapsed && (
        <div className="divide-y divide-border">
          {day.periods.map(period => (
            <div key={period.period} className="px-5 py-1">
              <div className="flex items-center gap-2 py-2.5">
                <span className="text-sm">{period.icon}</span>
                <p className="section-label">{period.period}</p>
              </div>
              <div>
                {period.items.map(item => (
                  <ItineraryItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
