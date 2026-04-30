import { useEffect, useRef, useState } from 'react'
import { Menu, Sparkles, Info, Bookmark, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import BottomNav from '../components/layout/BottomNav'
import ChatInput from '../components/chat/ChatInput'
import { ChatBubble } from '../components/chat/ChatBubble'
import { useChatStore } from '../store/useChatStore'
import { useUIStore } from '../store/useUIStore'
import { useItineraryStore } from '../store/useItineraryStore'
import { useTripStore } from '../store/useTripStore'
import { useSavedTripsStore } from '../store/useSavedTripsStore'
import { useAuthStore } from '../store/useAuthStore'
import { fmt } from '../utils/formatCurrency'

const QUICK_PROMPTS = [
  'Plan a 2-day heritage trip',
  'Best cafes in Jaipur',
  'How to reach Amer Fort by bus?',
  'Budget tips for Jaipur',
  'Best time to visit?',
  'Top bars & nightlife',
  'Rainy season places',
]

export default function ChatPlannerPage() {
  const navigate = useNavigate()
  const bottomRef = useRef()
  const { messages, streaming, sendMessage: apiSendMessage } = useChatStore()
  const { itinerary } = useItineraryStore()
  const { prefs } = useTripStore()
  const { saveTrip } = useSavedTripsStore()
  const { showToast, setSidebar } = useUIStore()
  const { isAuthenticated } = useAuthStore()

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const handleSend = async (text) => {
    if (!text.trim()) return

    if (!isAuthenticated) {
      showToast({ message: '🔒 Please login to use the AI chat', type: 'info' })
      navigate('/login', { state: { from: { pathname: '/plan/chat' } } })
      return
    }

    await apiSendMessage(text)
  }

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      showToast({ message: '🔒 Please login to save trips', type: 'info' })
      return
    }

    await saveTrip({
      title: `Jaipur ${prefs.days}-Day Trip`,
      city: 'jaipur',
      days: prefs.days,
      budget: prefs.budget,
      travelStyle: prefs.travelStyle,
      interests: prefs.interests,
      summary: `${prefs.travelStyle} trip to Jaipur — ${prefs.days} days, ₹${prefs.budget}/day`,
      itineraryJson: itinerary?._raw ? JSON.stringify(itinerary._raw) : '',
    })
    showToast({ message: '🔖 Trip saved!', type: 'success' })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-sand">
      {/* Sidebar — hidden on mobile, shown via toggle */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Chat header */}
        <div className="bg-white border-b border-border px-4 h-14 flex items-center gap-3 shrink-0">
          <button className="lg:hidden p-2 -ml-2 hover:bg-sand rounded-lg" onClick={() => setSidebar(true)}>
            <Menu size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink">Jaipur AI Trip Planner</p>
            <p className="text-[11px] text-accent font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" /> Online · Personalised
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {itinerary && (
              <button onClick={() => navigate('/itinerary')}
                className="btn-ghost text-xs gap-1.5 hidden sm:flex">
                <Info size={13} /> View Itinerary
              </button>
            )}
            <button onClick={handleSaveTrip}
              className="p-2 rounded-lg hover:bg-sand text-ink-muted hover:text-primary transition-colors" title="Save trip">
              <Bookmark size={16} />
            </button>
            <button onClick={() => showToast({ message: '🔗 Link copied to clipboard!', type: 'success' })}
              className="p-2 rounded-lg hover:bg-sand text-ink-muted hover:text-primary transition-colors" title="Share">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={msg.id || i}>
              <ChatBubble message={msg} />
              {/* Show suggestion chips if the AI reply included them */}
              {msg.role === 'ai' && msg.suggestions?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 ml-10">
                  {msg.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="chip text-xs py-1.5 whitespace-nowrap hover:chip-active transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-border px-4 pt-3 pb-4 pb-safe shrink-0">
          {/* Quick prompt chips */}
          <div className="flex gap-2 overflow-x-auto pb-2.5 mb-2.5 scrollbar-none">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => handleSend(p)}
                className="shrink-0 chip text-xs py-1.5 whitespace-nowrap">{p}</button>
            ))}
          </div>
          <ChatInput onSend={handleSend} disabled={streaming} />
        </div>
      </div>

      {/* ── RIGHT PANEL — trip summary (desktop only) ── */}
      {itinerary && (
        <div className="hidden xl:flex flex-col w-72 bg-white border-l border-border overflow-y-auto shrink-0">
          <div className="px-5 h-14 flex items-center border-b border-border">
            <p className="font-bold text-ink text-sm">Trip Details</p>
          </div>
          <div className="p-5 space-y-4">
            {/* City + days + budget */}
            <div className="space-y-2.5">
              {[
                { k:'📍 City',    v:'Jaipur, Rajasthan' },
                { k:'📅 Days',    v:`${prefs.days} ${prefs.days===1?'Day':'Days'}` },
                { k:'💰 Budget',  v:`${fmt(prefs.budget)} / day` },
                { k:'👥 Style',   v:prefs.travelStyle },
                { k:'✅ Est. Total', v:fmt(itinerary.totalCost) },
              ].map(r => (
                <div key={r.k} className="flex justify-between items-center">
                  <p className="text-xs text-ink-muted">{r.k}</p>
                  <p className="text-xs font-semibold text-ink">{r.v}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <button onClick={() => navigate('/itinerary')}
                className="btn-primary w-full justify-center py-2.5 text-sm">
                View Full Itinerary
              </button>
              <button onClick={handleSaveTrip}
                className="btn-secondary w-full justify-center py-2.5 text-sm">
                Save Trip
              </button>
              <button onClick={() => navigate('/plan/setup')}
                className="btn-ghost w-full justify-center py-2 text-sm">
                Edit Preferences
              </button>
            </div>

            {/* Interests */}
            {prefs.interests.length > 0 && (
              <div>
                <p className="section-label mb-2">Your Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {prefs.interests.map(i => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-primary-lighter text-primary font-medium">{i}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
