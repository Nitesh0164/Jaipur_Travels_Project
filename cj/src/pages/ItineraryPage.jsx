import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bookmark, Share2, Edit2, Map } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { ItineraryDayCard } from '../components/itinerary/ItineraryDayCard'
import BudgetBreakdown from '../components/itinerary/BudgetBreakdown'
import TravelTips from '../components/itinerary/TravelTips'
import { EmptyState } from '../components/ui/EmptyState'
import SkeletonCard from '../components/ui/SkeletonCard'
import { useItineraryStore } from '../store/useItineraryStore'
import { useUIStore } from '../store/useUIStore'
import { useSavedTripsStore } from '../store/useSavedTripsStore'
import { useAuthStore } from '../store/useAuthStore'
import { fmt } from '../utils/formatCurrency'
import { motion } from 'framer-motion'

export default function ItineraryPage() {
  const navigate = useNavigate()
  const { itinerary, loading, budgetBreakdown, preferences } = useItineraryStore()
  const { showToast } = useUIStore()
  const { saveTrip } = useSavedTripsStore()
  const { isAuthenticated } = useAuthStore()

  const handleSave = async () => {
    if (!itinerary) return

    if (!isAuthenticated) {
      showToast({ message: '🔒 Please login to save trips', type: 'info' })
      navigate('/login', { state: { from: { pathname: '/itinerary' } } })
      return
    }

    const totalStops = itinerary.days.reduce(
      (a, d) => a + d.periods.reduce((b, p) => b + p.items.length, 0),
      0
    )

    await saveTrip({
      title: itinerary.title,
      city: itinerary.city || 'Jaipur',
      days: itinerary.days.length,
      budget: preferences?.budget ?? budgetBreakdown?.totalBudget ?? itinerary.totalCost,
      travelStyle: preferences?.travelStyle ?? 'family',
      groupType: preferences?.groupType || preferences?.travelStyle || 'family',
      interests: preferences?.interests ?? [],
      summary: itinerary.summary,
      totalCost: itinerary.totalCost ?? 0,
      itineraryJson: itinerary._raw ? JSON.stringify(itinerary._raw) : '',
      notes: '',
    })

    showToast({ message: '🔖 Itinerary saved!', type: 'success' })
  }

  const handleShare = async () => {
    if (!itinerary) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: itinerary.title,
          text: itinerary.summary,
          url: window.location.href,
        })
      } catch {
        // ignore cancel
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      showToast({ message: '🔗 Link copied to clipboard!', type: 'success' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sand flex flex-col">
        <Navbar />
        <div className="max-w-3xl mx-auto w-full px-4 py-8 space-y-5">
          <SkeletonCard height="h-28" lines={1} />
          {[1, 2].map((i) => (
            <SkeletonCard key={i} height="h-56" lines={3} />
          ))}
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-sand flex flex-col">
        <Navbar />
        <EmptyState
          icon="🗺️"
          title="No itinerary yet"
          description="Plan a trip first to see your personalised day-wise Jaipur itinerary here."
          action={
            <button onClick={() => navigate('/plan/setup')} className="btn-primary">
              Plan My Trip
            </button>
          }
        />
        <BottomNav />
      </div>
    )
  }

  const totalStops = itinerary.days.reduce(
    (a, d) => a + d.periods.reduce((b, p) => b + p.items.length, 0),
    0
  )

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      {/* ── TOP SUMMARY STRIP ── */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft size={15} /> Back
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  AI Generated
                </span>
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold mb-1 leading-tight">
                {itinerary.title}
              </h1>

              <p className="text-white/80 text-sm leading-relaxed max-w-lg">
                {itinerary.summary}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSave}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                title="Save"
              >
                <Bookmark size={16} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                title="Share"
              >
                <Share2 size={16} />
              </button>

              <button
                onClick={() => navigate('/plan/setup')}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              '📍 Jaipur',
              `📅 ${itinerary.days.length} Days`,
              `🗺️ ${totalStops} Stops`,
              `💰 ${fmt(itinerary.totalCost)} total`,
              `👥 ${preferences?.travelStyle ?? 'family'}`,
            ].map((pill) => (
              <span
                key={pill}
                className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-3xl mx-auto w-full px-4 py-6 pb-24 md:pb-8 space-y-5">
        {/* Budget + trip summary strip */}
        <div className="card p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div>
              <p className="text-ink-faint">Budget</p>
              <p className="font-bold text-ink">
                {fmt(budgetBreakdown?.totalBudget ?? preferences?.budget ?? 0)}
              </p>
            </div>

            <div>
              <p className="text-ink-faint">Estimated</p>
              <p className="font-bold text-ink">
                {fmt(budgetBreakdown?.estimatedTotal ?? itinerary.totalCost)}
              </p>
            </div>

            <div>
              <p className="text-ink-faint">Remaining</p>
              <p className="font-bold text-accent">
                {fmt(budgetBreakdown?.remaining ?? 0)}
              </p>
            </div>

            <div>
              <p className="text-ink-faint">Days</p>
              <p className="font-bold text-ink">
                {preferences?.days ?? itinerary.days.length}
              </p>
            </div>

            <div>
              <p className="text-ink-faint">Travel Style</p>
              <p className="font-bold text-ink capitalize">
                {preferences?.travelStyle ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Day cards */}
        {itinerary.days.map((day, i) => (
          <motion.div
            key={day.dayNumber}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <ItineraryDayCard day={day} />
          </motion.div>
        ))}

        {/* Budget breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <BudgetBreakdown budget={itinerary.budget} />
        </motion.div>

        {/* Travel tips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TravelTips tips={itinerary.tips} />
        </motion.div>

        {/* Bottom actions */}
        <div className="card p-5 flex flex-col sm:flex-row gap-3">
          <button onClick={handleSave} className="btn-primary flex-1 justify-center py-3">
            <Bookmark size={15} /> Save This Trip
          </button>

          <button
            onClick={() => navigate('/plan/chat')}
            className="btn-secondary flex-1 justify-center py-3"
          >
            <Edit2 size={15} /> Modify with AI
          </button>

          <button onClick={handleShare} className="btn-ghost flex-1 justify-center py-3">
            <Share2 size={15} /> Share
          </button>
        </div>

        {/* Explore prompt */}
        <div className="bg-accent-light border border-accent/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-ink text-sm mb-1">
              Explore places in detail
            </p>
            <p className="text-xs text-ink-muted">
              View photos, tips, and directions for every spot on your itinerary.
            </p>
          </div>

          <button
            onClick={() => navigate('/explore')}
            className="btn-accent shrink-0 text-sm py-2"
          >
            <Map size={14} /> Explore
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}