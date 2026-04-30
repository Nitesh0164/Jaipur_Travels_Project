import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Bookmark, MessageCircle, BedDouble } from 'lucide-react'

const ITEMS = [
  { to:'/',           icon:Home,          label:'Home'    },
  { to:'/plan/chat',  icon:MessageCircle, label:'Planner' },
  { to:'/explore',    icon:Search,        label:'Explore' },
  { to:'/hotels',     icon:BedDouble,     label:'Hotels'  },
  { to:'/saved',      icon:Bookmark,      label:'Saved'   },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex">
        {ITEMS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to} className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors">
              <Icon size={20} className={active ? 'text-primary' : 'text-ink-faint'} strokeWidth={active ? 2.2 : 1.8} />
              <span className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-ink-faint'}`}>{label}</span>
            </Link>
          )
        })}
      </div>
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
