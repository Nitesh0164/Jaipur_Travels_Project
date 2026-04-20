import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Star,
  ChevronRight,
  Zap,
  MessageCircle,
  Map
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { getCityConfig } from '../data/cityConfig'
import { useItineraryStore } from '../store/useItineraryStore'
import { useChatStore } from '../store/useChatStore'
import { MOCK_ITINERARY } from '../data/mockItinerary'
import { motion } from 'framer-motion'

const cfg = getCityConfig('jaipur')

const CATEGORIES = [
  {
    emoji: '🏰',
    label: 'Heritage & Forts',
    desc: 'Amber, City Palace, Hawa Mahal',
    bg: 'from-amber-100 to-orange-100',
    border: 'border-amber-200'
  },
  {
    emoji: '☕',
    label: 'Cafes & Coffee',
    desc: 'Rooftop cafes, organic spots',
    bg: 'from-emerald-100 to-teal-100',
    border: 'border-emerald-200'
  },
  {
    emoji: '🍽️',
    label: 'Local Food',
    desc: 'Dal baati, lassi, street food',
    bg: 'from-orange-100 to-amber-100',
    border: 'border-orange-200'
  },
  {
    emoji: '💎',
    label: 'Hidden Gems',
    desc: 'Stepwells, secret viewpoints',
    bg: 'from-violet-100 to-purple-100',
    border: 'border-violet-200'
  },
  {
    emoji: '🛍️',
    label: 'Shopping & Crafts',
    desc: 'Textiles, jewellery, jutis',
    bg: 'from-pink-100 to-rose-100',
    border: 'border-pink-200'
  },
  {
    emoji: '📸',
    label: 'Photography Spots',
    desc: 'Golden hour, iconic angles',
    bg: 'from-blue-100 to-indigo-100',
    border: 'border-blue-200'
  }
]

const HOW_IT_WORKS = [
  {
    icon: MessageCircle,
    step: '01',
    title: 'Tell us your trip',
    desc: 'Share your budget, days, interests, and travel style in under 60 seconds.'
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'AI builds your plan',
    desc: 'Our AI crafts a personalised day-wise itinerary with costs, tips, and food picks.'
  },
  {
    icon: Map,
    step: '03',
    title: 'Explore & adjust',
    desc: 'Edit anything, save your trip, and discover places along the way.'
  }
]

const STATS = [
  { val: '500+', label: 'Jaipur places' },
  { val: '10k+', label: 'Trips planned' },
  { val: '₹0', label: 'Always free' }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const { setItinerary } = useItineraryStore()
  const { addMessage } = useChatStore()

  const handlePromptSubmit = (text) => {
    const t = text.trim() || prompt.trim()
    if (!t) return
    addMessage({
      role: 'user',
      type: 'text',
      text: t,
      ts: new Date().toISOString()
    })
    navigate('/plan/chat')
  }

  const handleChip = (p) => {
    setPrompt(p)
    handlePromptSubmit(p)
  }

  const handleQuickPlan = () => {
    setItinerary(MOCK_ITINERARY)
    navigate('/itinerary')
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-60 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 md:order-1"
            >
              <div className="inline-flex items-center gap-2 bg-primary-lighter border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <Sparkles size={13} className="text-primary" />
                <span className="text-xs font-bold text-primary tracking-wide">
                  AI-Powered Travel Planner
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-[1.12] mb-5">
                Plan Your Perfect
                <br />
                <span className="text-primary italic">Jaipur Journey</span>
              </h1>

              <p className="text-base text-ink-muted leading-relaxed mb-8 max-w-md">
                Day-wise itineraries, budget breakdowns, hidden gems, and local food picks —
                all crafted by AI in seconds, completely free.
              </p>

              <div className="flex gap-6 mb-8">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-bold text-ink">{s.val}</p>
                    <p className="text-xs text-ink-muted">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-card p-1.5 mb-4 flex gap-2">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit(prompt)}
                  placeholder='e.g. "2-day Jaipur trip under ₹3,000"'
                  className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm text-ink placeholder:text-ink-faint"
                />
                <button
                  onClick={() => handlePromptSubmit(prompt)}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2 shrink-0"
                >
                  Plan it <ArrowRight size={14} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {cfg.prompts.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleChip(p)}
                    className="chip text-xs py-1.5"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/plan/setup')}
                  className="btn-primary gap-2"
                >
                  <Map size={15} /> Start Planning
                </button>
                <button
                  onClick={() => navigate('/explore')}
                  className="btn-secondary gap-2"
                >
                  Explore Places
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="order-1 md:order-2 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] max-h-[520px] bg-gray-100">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg"
                  alt="Hawa Mahal, Jaipur"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/fallback.jpg'
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 shadow-lg border border-white/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0">
                        <MapPin size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-ink text-sm">Hawa Mahal</p>
                        <p className="text-xs text-ink-muted">Palace of Winds · Old City</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-ink">4.6</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  🏰 Jaipur, Rajasthan
                </div>
              </div>

              <div className="absolute -right-3 top-16 bg-white rounded-2xl shadow-lift border border-border p-3.5 w-44 hidden lg:block">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={12} className="text-primary" />
                  <p className="text-[11px] font-bold text-ink">AI Itinerary Ready</p>
                </div>
                <p className="text-[10px] text-ink-muted mb-2.5">
                  2-day heritage trail crafted for you
                </p>
                <button
                  onClick={handleQuickPlan}
                  className="w-full text-[11px] font-bold text-primary bg-primary-lighter rounded-lg py-1.5 hover:bg-primary-light transition-colors"
                >
                  View Plan →
                </button>
              </div>

              <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lift border border-border p-3.5 hidden lg:block">
                <p className="text-[10px] text-ink-faint mb-1">Best time to visit</p>
                <p className="text-sm font-bold text-ink">Oct – Mar</p>
                <p className="text-[10px] text-accent mt-1">✓ Pleasant weather</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Simple process</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">
              From idea to itinerary
              <br />
              in under 60 seconds
            </h2>
            <p className="text-ink-muted max-w-md mx-auto text-sm">
              No sign-up. No credit card. Just tell us what you want and the AI does the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 group hover:shadow-lift transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary-lighter flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <step.icon
                      size={18}
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                  <span className="text-2xl font-display font-bold text-primary/20">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-white border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-2">Browse Jaipur</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
                Explore by category
              </h2>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="btn-ghost text-sm hidden sm:flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate('/explore')}
                className={`group bg-gradient-to-br ${cat.bg} border ${cat.border} rounded-2xl p-4 text-left hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </div>
                <p className="text-xs font-bold text-ink mb-1 leading-tight">
                  {cat.label}
                </p>
                <p className="text-[10px] text-ink-muted leading-snug">{cat.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="section-label mb-3">See it in action</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">
            Here's what your
            <br />
            itinerary looks like
          </h2>
          <p className="text-ink-muted text-sm">
            Structured, detailed, and actually useful — not just a list of places.
          </p>
        </div>

        <div className="max-w-2xl mx-auto card overflow-hidden shadow-lift">
          <div className="bg-gradient-to-r from-primary-lighter to-accent-light px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">
                🗺️
              </div>
              <div>
                <p className="font-bold text-ink text-sm">2-Day Heritage Family Trail</p>
                <p className="text-xs text-ink-muted">Jaipur · ₹7,720 estimated · 12 stops</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary bg-primary-lighter px-2.5 py-1 rounded-full">
              Day 1
            </span>
          </div>

          <div className="px-6 py-1">
            {[
              {
                time: '7:30 AM',
                place: 'Amber Fort',
                cat: 'Heritage',
                cost: '₹200',
                note: 'Sunrise at the fort — golden light on the walls.',
                highlight: true
              },
              {
                time: '10:30 AM',
                place: 'Panna Meena Ka Kund',
                cat: 'Hidden Gem',
                cost: 'Free',
                note: '5-min walk from Amber Fort. Geometric stepwell.',
                highlight: false
              },
              {
                time: '12:00 PM',
                place: 'Anokhi Cafe',
                cat: 'Cafe',
                cost: '₹400',
                note: 'Organic lunch in a heritage haveli courtyard.',
                highlight: false
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`flex gap-4 py-4 border-b border-border last:border-0 ${
                  item.highlight ? 'bg-primary-lighter/50 -mx-6 px-6 rounded-lg' : ''
                }`}
              >
                <div className="w-16 shrink-0">
                  <p className="text-xs font-bold text-primary">{item.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-ink">{item.place}</p>
                    {item.highlight && (
                      <Star size={11} className="text-primary fill-primary" />
                    )}
                  </div>
                  <p className="text-xs text-ink-muted">{item.note}</p>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      item.cat === 'Heritage'
                        ? 'bg-amber-100 text-amber-800'
                        : item.cat === 'Hidden Gem'
                        ? 'bg-violet-100 text-violet-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.cat}
                  </span>
                </div>
                <p className="text-sm font-bold text-accent shrink-0">{item.cost}</p>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-sand flex items-center justify-between">
            <p className="text-xs text-ink-muted">+9 more stops across 2 days</p>
            <button
              onClick={handleQuickPlan}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
            >
              View full plan <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-primary via-primary to-secondary rounded-3xl px-8 py-12 text-center text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 mahal-pattern opacity-20 pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-semibold">
                <Sparkles size={14} /> Free forever
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Ready to explore
                <br />
                the Pink City?
              </h2>
              <p className="text-white/80 mb-8 text-sm leading-relaxed max-w-sm mx-auto">
                Join thousands of travellers who planned their perfect Jaipur trip with AI.
                No account needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/plan/setup')}
                  className="bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-lighter transition-colors flex items-center justify-center gap-2"
                >
                  Create My Itinerary <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate('/plan/chat')}
                  className="bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} /> Chat with AI Planner
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-6 text-center">
        <p className="text-xs text-ink-faint">
          © 2025 CompleteJaipur · Built with ❤️ for travellers exploring the Pink City
        </p>
      </footer>

      <BottomNav />
    </div>
  )
}