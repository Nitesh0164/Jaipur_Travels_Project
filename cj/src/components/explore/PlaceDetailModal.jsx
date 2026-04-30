import { MapPin, Clock, Timer, Sun, Star, Plus, ExternalLink } from 'lucide-react'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import { fmt } from '../../utils/formatCurrency'
import { useUIStore } from '../../store/useUIStore'

export default function PlaceDetailModal({ place, open, onClose }) {
  const { showToast } = useUIStore()

  if (!place) return null

  const handleAdd = () => {
    showToast({ message: `${place.name} added to your trip!`, type: 'success' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      {/* Banner */}
      <div className={`h-52 bg-gradient-to-br ${place.bg} flex items-center justify-center relative overflow-hidden`}>
        <span className="text-8xl drop-shadow-lg">{place.emoji}</span>
        {/* Rating pill */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-ink">{place.rating}</span>
          <span className="text-xs text-ink-faint">({(place.reviews/1000).toFixed(1)}k)</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Title */}
        <div>
          <div className="flex items-start gap-2 mb-1">
            <h2 className="font-display text-2xl font-bold text-ink leading-tight flex-1">{place.name}</h2>
            {place.mustSee && (
              <span className="mt-1 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shrink-0">Must See</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin size={13} className="text-primary" /> {place.area}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {place.tags.map(t => <Badge key={t} label={t} />)}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Clock,  label: 'Duration',     val: place.duration },
            { icon: Sun,    label: 'Best Time',    val: place.bestTime },
            { icon: Timer,  label: 'Open Hours',   val: place.openHours },
            { icon: MapPin, label: 'Entry Fee',    val: place.entryFee === 0 ? 'Free' : fmt(place.entryFee) },
          ].map(m => (
            <div key={m.label} className="bg-sand rounded-xl px-3.5 py-3">
              <p className="text-[10px] text-ink-faint mb-1 font-semibold uppercase tracking-wider">{m.label}</p>
              <p className="text-sm font-semibold text-ink">{m.val}</p>
            </div>
          ))}
        </div>

        {/* Overview */}
        <div>
          <p className="section-label mb-2">Overview</p>
          <p className="text-sm text-ink-muted leading-relaxed">{place.overview}</p>
        </div>

        {/* Tip */}
        {place.tip && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">💡 Insider Tip</p>
            <p className="text-xs text-amber-900 leading-relaxed">{place.tip}</p>
          </div>
        )}

        {/* Nearby */}
        {place.nearby?.length > 0 && (
          <div>
            <p className="section-label mb-2">Nearby Places</p>
            <div className="flex flex-wrap gap-1.5">
              {place.nearby.map(n => (
                <span key={n} className="text-xs px-2.5 py-1 rounded-full bg-sand border border-border text-ink-muted">{n}</span>
              ))}
            </div>
          </div>
        )}

        {/* Food nearby */}
        {place.nearbyFood?.length > 0 && (
          <div>
            <p className="section-label mb-2">Nearby Food & Cafes</p>
            <div className="flex flex-wrap gap-1.5">
              {place.nearbyFood.map(n => (
                <span key={n} className="text-xs px-2.5 py-1 rounded-full bg-accent-light border border-accent/20 text-accent-dark">{n}</span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button onClick={handleAdd}
          className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
          <Plus size={16} /> Add to My Trip
        </button>
      </div>
    </Modal>
  )
}
