import { motion } from 'framer-motion'
import { Sparkles, User } from 'lucide-react'
import { fmt } from '../../utils/formatCurrency'
import Badge from '../ui/Badge'
import { useNavigate } from 'react-router-dom'
import { useItineraryStore } from '../../store/useItineraryStore'

// --- ChatBubble ---
export function ChatBubble({ message }) {
  const isAI = message.role === 'ai'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isAI ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-ink'}`}>
        {isAI ? <Sparkles size={14} /> : <User size={14} />}
      </div>

      {/* Content */}
      <div className={`max-w-[82%] ${isAI ? '' : ''}`}>
        {message.type === 'text' && (
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isAI ? 'bg-white border border-border text-ink rounded-tl-sm shadow-sm' : 'bg-primary text-white rounded-tr-sm'
          }`}>
            {message.text}
          </div>
        )}
        {message.type === 'itinerary_card' && (
          <div className="space-y-2 w-full">
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-ink shadow-sm">
              {message.text}
            </div>
            <AIResponseCard itinerary={message.itinerary} />
          </div>
        )}
        {message.type === 'typing' && (
          <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <div className="flex gap-1 items-center h-4">
              {[0,1,2].map(i => (
                <span key={i} className="typing-dot w-2 h-2 rounded-full bg-ink-faint" style={{ animationDelay:`${i*0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <p className="text-[10px] text-ink-faint mt-1 px-1">
          {new Date(message.ts).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

// --- AIResponseCard (compact inline preview) ---
export function AIResponseCard({ itinerary }) {
  const navigate = useNavigate()
  const { setItinerary } = useItineraryStore()

  const handleView = () => {
    setItinerary(itinerary)
    navigate('/itinerary')
  }

  const day1 = itinerary?.days?.[0]
  const totalCost = itinerary?.totalCost

  return (
    <div className="card overflow-hidden w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-lighter to-accent-light px-4 py-3 flex items-center gap-3 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-base">🗺️</div>
        <div>
          <p className="font-semibold text-ink text-sm">{itinerary.title}</p>
          <p className="text-xs text-ink-muted">{itinerary.days.length} days · {fmt(totalCost)} estimated</p>
        </div>
      </div>

      {/* Day 1 preview */}
      {day1 && (
        <div className="px-4 py-3">
          <p className="section-label mb-2">{day1.emoji} {day1.theme}</p>
          <div className="space-y-2">
            {day1.periods[0]?.items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-[11px] text-ink-faint font-mono w-14 shrink-0">{item.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{item.place}</p>
                </div>
                <Badge label={item.category} className="shrink-0" />
                <span className="text-xs font-semibold text-accent shrink-0">{item.cost === 0 ? 'Free' : fmt(item.cost)}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-faint mt-2">+{itinerary.days.reduce((a,d) => a + d.periods.reduce((b,p) => b + p.items.length, 0), 0) - 2} more stops across {itinerary.days.length} days</p>
        </div>
      )}

      {/* CTA */}
      <div className="px-4 pb-4">
        <button onClick={handleView}
          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
          View Full Itinerary →
        </button>
      </div>
    </div>
  )
}

// --- SmartActionChips ---
export function SmartActionChips({ chips, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3 pl-11">
      {chips.map(c => (
        <button key={c.id} onClick={() => onSelect(c.prompt)}
          className="chip text-xs py-1.5 px-3 hover:scale-[1.02] active:scale-[0.98] transition-transform">
          {c.label}
        </button>
      ))}
    </div>
  )
}
