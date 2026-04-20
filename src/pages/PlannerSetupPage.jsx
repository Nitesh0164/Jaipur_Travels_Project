import { useNavigate } from 'react-router-dom'
import { ArrowRight, MessageCircle, ChevronLeft } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import PlannerForm from '../components/planner/PlannerForm'
import TripSummaryCard from '../components/planner/TripSummaryCard'
import { useItineraryStore } from '../store/useItineraryStore'
import { useChatStore } from '../store/useChatStore'
import { useUIStore } from '../store/useUIStore'
import { buildBudgetFriendlyItinerary } from '../utils/budgetPlanner'
import { useState } from 'react'

const DEFAULT_PREFS = {
  city: 'Jaipur',
  days: 2,
  budget: 3000,
  travelStyle: 'family',
  interests: ['heritage', 'food'],
  stayPreference: 'budget',
  transportPreference: 'mixed',
  pace: 'balanced',
}

export default function PlannerSetupPage() {
  const navigate = useNavigate()
  const { setGeneratedTrip, setLoading } = useItineraryStore()
  const { addMessage } = useChatStore()
  const { showToast } = useUIStore()
  const [generating, setGenerating] = useState(false)
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)

  const handleGenerate = async () => {
    setGenerating(true)
    setLoading(true)

    await new Promise((r) => setTimeout(r, 900))

    const result = buildBudgetFriendlyItinerary(prefs)

    setGeneratedTrip({
      itinerary: result.itinerary,
      budgetBreakdown: result.budgetBreakdown,
      preferences: prefs,
    })

    showToast({
      message: `✨ Itinerary ready within ₹${prefs.budget}!`,
      type: 'success',
    })

    setGenerating(false)
    navigate('/itinerary')
  }

  const handleSkipToChat = () => {
    addMessage({
      role: 'user',
      type: 'text',
      text: `I've set up my trip preferences for ${prefs.days} days in ${prefs.city} with a budget of ₹${prefs.budget}. Can you build my itinerary?`,
      ts: new Date().toISOString(),
    })
    navigate('/plan/chat')
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-24 md:pb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-6 transition-colors"
        >
          <ChevronLeft size={15} /> Back to home
        </button>

        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">
            Set Up Your Trip
          </h1>
          <p className="text-ink-muted text-sm">
            Tell us about your trip and we&apos;ll craft a personalised Jaipur itinerary.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          <div className="card p-6">
            <PlannerForm value={prefs} onChange={setPrefs} />

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary flex-1 justify-center py-3 text-base"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Building your itinerary…
                  </>
                ) : (
                  <>
                    <span>✨</span> Generate My Itinerary <ArrowRight size={15} />
                  </>
                )}
              </button>

              <button
                onClick={handleSkipToChat}
                className="btn-secondary flex items-center justify-center gap-2 py-3"
              >
                <MessageCircle size={15} /> Chat with AI Instead
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <TripSummaryCard prefs={prefs} />
          </div>
        </div>

        <div className="lg:hidden mt-6">
          <TripSummaryCard prefs={prefs} />
        </div>
      </div>

      <BottomNav />
    </div>
  )
}