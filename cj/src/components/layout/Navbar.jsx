import { Link, useLocation } from 'react-router-dom'
import { MapPin, Menu, X, Bus, CloudSun, BedDouble } from 'lucide-react'
import { useState } from 'react'
import Button from '../ui/Button'

const NAV_LINKS = [
  { to: '/explore', label: 'Explore' },
  { to: '/hotels', label: 'Hotels', icon: BedDouble },
  { to: '/budget', label: 'Budget' },
  { to: '/buses', label: 'Buses', icon: Bus },
  { to: '/weather', label: 'Weather', icon: CloudSun },
  { to: '/saved', label: 'Saved' },
]

export default function Navbar({ transparent = false }) {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const base = transparent
    ? 'bg-transparent border-transparent'
    : 'bg-white/90 backdrop-blur-md border-border shadow-sm'

  return (
    <header className={`sticky top-0 z-40 border-b ${base} transition-all`}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-ink">
            Complete<span className="text-primary">Jaipur</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const Icon = l.icon
            const isActive = pathname === l.to

            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-primary bg-primary-lighter'
                    : 'text-ink-muted hover:text-ink hover:bg-sand-dark'
                }`}
              >
                {Icon ? <Icon size={15} /> : null}
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => (window.location.href = '/plan/setup')}
            className="hidden md:inline-flex"
          >
            Plan My Trip
          </Button>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-sand-dark"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((l) => {
            const Icon = l.icon

            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink-muted hover:text-ink hover:bg-sand flex items-center gap-2"
              >
                {Icon ? <Icon size={16} /> : null}
                {l.label}
              </Link>
            )
          })}

          <Button
            variant="primary"
            className="mt-2 w-full"
            onClick={() => {
              setMenuOpen(false)
              window.location.href = '/plan/setup'
            }}
          >
            Plan My Trip
          </Button>
        </div>
      )}
    </header>
  )
}