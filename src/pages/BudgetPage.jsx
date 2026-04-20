import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { calcBudgetBreakdown, BUDGET_COLORS, BUDGET_ICONS, BUDGET_LABELS } from '../utils/budgetCalculator'
import { fmt } from '../utils/formatCurrency'
import { ArrowRight, Info } from 'lucide-react'
import { motion } from 'framer-motion'

const PRESETS = [
  { label: 'Budget trip',   budget: 1500, days: 2, icon: '🎒' },
  { label: 'Mid-range',     budget: 3500, days: 3, icon: '✈️' },
  { label: 'Comfort trip',  budget: 7000, days: 3, icon: '🌟' },
  { label: 'Luxury trip',   budget: 20000, days: 4, icon: '👑' },
]

export default function BudgetPage() {
  const navigate = useNavigate()
  const [budget, setBudget] = useState(3000)
  const [days, setDays]     = useState(3)
  const [stay, setStay]     = useState('Mid-range Hotel')

  const breakdown = calcBudgetBreakdown({ budget, days, stay })
  const entries   = Object.entries(breakdown).filter(([k]) => k !== 'total')

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto w-full px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">
            Budget Planner
          </h1>
          <p className="text-ink-muted text-sm">
            See exactly how your travel budget breaks down across accommodation, food, transport, and attractions.
          </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {PRESETS.map(p => (
            <button key={p.label}
              onClick={() => { setBudget(p.budget); setDays(p.days) }}
              className={`card p-3 text-left hover:shadow-lift transition-all ${
                budget === p.budget && days === p.days ? 'border-primary bg-primary-lighter' : ''
              }`}>
              <span className="text-xl mb-1.5 block">{p.icon}</span>
              <p className="text-xs font-bold text-ink">{p.label}</p>
              <p className="text-[11px] text-ink-muted">{fmt(p.budget)}/day · {p.days}d</p>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="card p-6 mb-5">
          <h2 className="font-bold text-ink mb-5">Customise Your Budget</h2>
          <div className="grid sm:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">Budget per day (₹)</label>
              <input
                type="number" min={300} step={100}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="input"
              />
              <input
                type="range" min={300} max={25000} step={100}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full mt-2 accent-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">Number of days</label>
              <select className="select" value={days} onChange={e => setDays(Number(e.target.value))}>
                {[1,2,3,4,5,7,10].map(d => <option key={d} value={d}>{d} {d===1?'Day':'Days'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">Stay type</label>
              <select className="select" value={stay} onChange={e => setStay(e.target.value)}>
                {['Budget Hostel','Guesthouse','Mid-range Hotel','Heritage Haveli','Luxury Resort'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="card p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-ink">Cost Breakdown</h2>
            <div className="text-right">
              <p className="text-[11px] text-ink-faint">Total for {days} days</p>
              <p className="text-2xl font-bold text-primary">{fmt(breakdown.total)}</p>
            </div>
          </div>

          {/* Stacked bar */}
          <div className="flex rounded-xl overflow-hidden h-4 mb-6 gap-0.5">
            {entries.map(([key, val]) => (
              <div
                key={key}
                className={`${BUDGET_COLORS[key]?.bar ?? 'bg-gray-200'} transition-all duration-500`}
                style={{ width: `${(val / breakdown.total * 100).toFixed(1)}%` }}
                title={`${BUDGET_LABELS[key]}: ${fmt(val)}`}
              />
            ))}
          </div>

          {/* Category rows */}
          <div className="space-y-4">
            {entries.map(([key, val], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${BUDGET_COLORS[key]?.bg ?? 'bg-gray-100'}`}>
                  {BUDGET_ICONS[key]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-ink">{BUDGET_LABELS[key]}</p>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${BUDGET_COLORS[key]?.text ?? 'text-ink'}`}>{fmt(val)}</p>
                      <p className="text-[10px] text-ink-faint">{fmt(Math.round(val / days))}/day</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${BUDGET_COLORS[key]?.bar ?? 'bg-gray-300'} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(val / breakdown.total * 100).toFixed(1)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-amber-600" />
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Money-saving tips</p>
          </div>
          <ul className="space-y-2">
            {[
              'Book Amber Fort tickets online — saves ₹50 and the queue.',
              'Use city buses (₹15–30) instead of Uber for short hops.',
              'Eat at local dhabas for lunch — half the price of cafes.',
              `${budget < 2000 ? 'Stay at Zostel Jaipur — great hostel from ₹600/bed.' : 'Pearl Palace Hotel has excellent value with a rooftop pool.'}`,
            ].map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs text-amber-900 leading-relaxed">
                <span className="text-amber-500 mt-0.5">✓</span> {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/plan/setup')}
          className="btn-primary w-full justify-center py-3.5 text-base"
        >
          Generate Itinerary for {fmt(breakdown.total)} <ArrowRight size={16} />
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
