import { Link, useLocation } from 'react-router-dom'
import { MapPin, Plus, Bookmark, Search, DollarSign, MessageCircle, ChevronLeft } from 'lucide-react'
import { useSavedTripsStore } from '../../store/useSavedTripsStore'
import { useUIStore } from '../../store/useUIStore'

const NAV = [
  { to:'/plan/chat',  icon:MessageCircle, label:'AI Planner' },
  { to:'/explore',    icon:Search,        label:'Explore Places' },
  { to:'/budget',     icon:DollarSign,    label:'Budget Planner' },
  { to:'/saved',      icon:Bookmark,      label:'Saved Trips' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { trips } = useSavedTripsStore()
  const { sidebarOpen, setSidebar } = useUIStore()

  return (
    <>
      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebar(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-border z-40 flex flex-col
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-auto
      `}>
        {/* Logo */}
        <div className="px-5 h-14 flex items-center justify-between border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold">
              Complete<span className="text-primary">Jaipur</span>
            </span>
          </Link>
          <button className="lg:hidden p-1 hover:bg-sand rounded" onClick={() => setSidebar(false)}>
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New trip CTA */}
        <div className="px-4 pt-4">
          <Link to="/plan/setup"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
            <Plus size={15} /> New Trip
          </Link>
        </div>

        {/* Nav */}
        <nav className="px-2 pt-3 flex flex-col gap-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === to ? 'bg-primary-lighter text-primary' : 'text-ink-muted hover:text-ink hover:bg-sand'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Recent saved trips */}
        {trips.length > 0 && (
          <div className="px-4 pt-5 pb-4 mt-auto border-t border-border">
            <p className="section-label mb-3">Recent Trips</p>
            <div className="flex flex-col gap-1">
              {trips.slice(0, 3).map(t => (
                <Link key={t.id} to="/itinerary"
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sand transition-colors group">
                  <span className="text-base">{t.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{t.title}</p>
                    <p className="text-[11px] text-ink-faint">{t.days}d · ₹{t.budget?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
