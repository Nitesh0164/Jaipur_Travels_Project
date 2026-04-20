import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Share2, Eye, Plus, Calendar, Users, DollarSign } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { EmptyState } from '../components/ui/EmptyState'
import { useSavedTripsStore } from '../store/useSavedTripsStore'
import { useUIStore } from '../store/useUIStore'
import { useItineraryStore } from '../store/useItineraryStore'
import { MOCK_ITINERARY } from '../data/mockItinerary'
import { fmt } from '../utils/formatCurrency'
import { motion, AnimatePresence } from 'framer-motion'

function SavedTripCard({ trip, onView, onDelete, onShare }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card overflow-hidden hover:shadow-lift transition-all duration-200 group"
    >
      {/* Banner */}
      <div className={`h-36 bg-gradient-to-br ${trip.bg || 'from-amber-100 to-orange-200'} flex items-center justify-center relative overflow-hidden`}>
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{trip.emoji}</span>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-ink capitalize">
          {trip.city}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-ink text-sm mb-1 leading-snug">{trip.title}</h3>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          <span className="flex items-center gap-1 text-[11px] text-ink-muted">
            <Calendar size={10} /> {trip.days} {trip.days === 1 ? 'day' : 'days'}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-ink-muted">
            <DollarSign size={10} /> {fmt(trip.budget)}/day
          </span>
          <span className="flex items-center gap-1 text-[11px] text-ink-muted">
            <Users size={10} /> {trip.travelStyle}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {trip.interests?.slice(0, 3).map(i => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-lighter text-primary font-semibold">{i}</span>
          ))}
          {trip.interests?.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-ink-muted font-semibold">+{trip.interests.length - 3}</span>
          )}
        </div>

        {/* Summary */}
        <p className="text-[11px] text-ink-muted leading-relaxed mb-4 line-clamp-2">{trip.summary}</p>

        {/* Date */}
        <p className="text-[10px] text-ink-faint mb-3">
          Saved {new Date(trip.savedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border">
          <button onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors">
            <Eye size={12} /> View
          </button>
          <button onClick={onShare}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:border-primary hover:text-primary text-ink-muted transition-colors">
            <Share2 size={13} />
          </button>
          <button onClick={onDelete}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:border-red-200 hover:text-red-500 text-ink-muted transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function SavedTripsPage() {
  const navigate = useNavigate()
  const { trips, deleteTrip } = useSavedTripsStore()
  const { showToast } = useUIStore()
  const { setItinerary } = useItineraryStore()
  const [view, setView] = useState('grid')

  const handleView = (trip) => {
    // Load the mock itinerary when viewing any saved trip
    setItinerary(MOCK_ITINERARY)
    navigate('/itinerary')
  }

  const handleDelete = (trip) => {
    deleteTrip(trip.id)
    showToast({ message: `🗑️ "${trip.title}" deleted`, type: 'info' })
  }

  const handleShare = (trip) => {
    navigator.clipboard.writeText(`Check out my Jaipur trip: ${trip.title} — planned with CompleteJaipur.in`)
    showToast({ message: '🔗 Trip link copied!', type: 'success' })
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-1">
              Saved Trips
            </h1>
            <p className="text-ink-muted text-sm">
              {trips.length} trip{trips.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <button onClick={() => navigate('/plan/setup')}
            className="btn-primary gap-2">
            <Plus size={15} /> New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="No saved trips yet"
            description="Plan a Jaipur trip and save it here for easy access later. Your trips stay saved even when you close the browser."
            action={
              <button onClick={() => navigate('/plan/setup')} className="btn-primary gap-2">
                <Plus size={15} /> Plan My First Trip
              </button>
            }
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map(trip => (
                <SavedTripCard
                  key={trip.id}
                  trip={trip}
                  onView={() => handleView(trip)}
                  onDelete={() => handleDelete(trip)}
                  onShare={() => handleShare(trip)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
