import { useNavigate } from 'react-router-dom'
import { MapPinned, Route, LogOut, PlusCircle } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { useAuthStore } from '../store/useAuthStore'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-primary font-semibold mb-2">Admin Panel</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">
              Welcome, {user?.name || 'Admin'}
            </h1>
            <p className="text-sm text-ink-muted">
              Manage places, routes, and future customer-facing travel data.
            </p>
          </div>

          <button onClick={handleLogout} className="btn-secondary gap-2">
            <LogOut size={15} /> Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <button
            onClick={() => navigate('/admin/places')}
            className="card p-6 text-left hover:shadow-lift transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-lighter flex items-center justify-center mb-4">
              <MapPinned size={22} className="text-primary" />
            </div>
            <h3 className="font-bold text-ink text-lg mb-1">Manage Places</h3>
            <p className="text-sm text-ink-muted">
              Add, edit, and organise Jaipur attractions, cafes, and landmarks.
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/buses')}
            className="card p-6 text-left hover:shadow-lift transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent-light flex items-center justify-center mb-4">
              <Route size={22} className="text-accent" />
            </div>
            <h3 className="font-bold text-ink text-lg mb-1">Manage Bus Routes</h3>
            <p className="text-sm text-ink-muted">
              Add Jaipur bus routes, stops, and future transport suggestions.
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/places')}
            className="card p-6 text-left hover:shadow-lift transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
              <PlusCircle size={22} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-ink text-lg mb-1">Quick Add</h3>
            <p className="text-sm text-ink-muted">
              Jump into your content management flow and add more Jaipur data.
            </p>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}