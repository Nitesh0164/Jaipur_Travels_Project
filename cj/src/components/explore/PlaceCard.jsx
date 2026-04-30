import { MapPin, Clock, Star, Plus, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { fmt } from '../../utils/formatCurrency'

// --- PlaceCard ---
export function PlaceCard({ place, onView, onAdd }) {
  return (
    <div
      className="card overflow-hidden group hover:shadow-lift transition-all duration-200 cursor-pointer"
      onClick={onView}
    >
      {/* Image area */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={place.image || '/images/places/fallback.jpg'}
          alt={place.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/images/places/fallback.jpg'
          }}
        />

        {place.mustSee && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Must See
          </span>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          <span className="text-[11px] font-bold text-ink">{place.rating}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-ink text-sm leading-snug">{place.name}</h3>
          <Badge label={place.category} className="shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-1 text-ink-faint text-[11px] mb-2">
          <MapPin size={10} /> {place.area}
        </div>

        <p className="text-xs text-ink-muted leading-relaxed line-clamp-2 mb-3">
          {place.shortDesc}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-ink-muted mb-3">
          <span className="flex items-center gap-1">
            <Clock size={10} /> {place.duration}
          </span>
          <span className="font-semibold text-accent">
            {place.entryFee === 0 ? 'Free entry' : `${fmt(place.entryFee)} entry`}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold text-ink-muted hover:border-primary hover:text-primary hover:bg-primary-lighter transition-colors flex items-center justify-center gap-1"
          >
            View <ChevronRight size={12} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition-colors shrink-0"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// --- FilterBar ---
export function FilterBar({ filters, active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`chip ${active === f ? 'chip-active' : ''}`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}

// --- SearchBar ---
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
      />
    </div>
  )
}