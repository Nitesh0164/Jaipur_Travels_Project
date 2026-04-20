import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { useBusStore } from '../store/useBusStore'
import { useUIStore } from '../store/useUIStore'

const INITIAL_FORM = {
  routeNo: '',
  routeType: 'Regular',
  category: 'Urban',
  from: '',
  to: '',
  fareMin: '',
  fareMax: '',
  distanceKm: '',
  stopsCount: '',
  headwayMinutes: '',
  busesOnRoute: '',
  pathPreview: '',
}

export default function AdminBusesPage() {
  const navigate = useNavigate()
  const { addRoute, routes, deleteRoute } = useBusStore()
  const { showToast } = useUIStore()
  const [form, setForm] = useState(INITIAL_FORM)
  const [message, setMessage] = useState('')

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddRoute = () => {
    if (!form.routeNo.trim() || !form.from.trim() || !form.to.trim()) {
      setMessage('Please fill Route number, From, and To.')
      return
    }

    addRoute({
      routeNo: form.routeNo,
      routeType: form.routeType,
      category: form.category,
      from: form.from,
      to: form.to,
      fareMin: Number(form.fareMin || 0),
      fareMax: Number(form.fareMax || 0),
      distanceKm: Number(form.distanceKm || 0),
      stopsCount: Number(form.stopsCount || 0),
      headwayMinutes: Number(form.headwayMinutes || 0),
      busesOnRoute: Number(form.busesOnRoute || 0),
      pathPreview: form.pathPreview
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    })

    setMessage('Bus route added successfully.')
    setForm(INITIAL_FORM)
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-24 md:pb-8">
        <button
          onClick={() => navigate('/admin')}
          className="text-sm text-primary mb-4"
        >
          ← Back to Admin Dashboard
        </button>

        <h1 className="font-display text-3xl font-bold text-ink mb-2">
          Manage Bus Routes
        </h1>

        <p className="text-sm text-ink-muted mb-6">
          Add and manage Jaipur bus routes, route numbers, stops, fares, and timings.
        </p>

        <div className="card p-6 mb-8">
          <p className="font-semibold text-ink mb-3">Add New Bus Route</p>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="input"
              placeholder="Route number"
              value={form.routeNo}
              onChange={(e) => handleChange('routeNo', e.target.value)}
            />

            <select
              className="select"
              value={form.routeType}
              onChange={(e) => handleChange('routeType', e.target.value)}
            >
              <option value="Regular">Regular</option>
              <option value="AC">AC</option>
              <option value="Circular">Circular</option>
            </select>

            <select
              className="select"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="Urban">Urban</option>
              <option value="Sub-Urban">Sub-Urban</option>
              <option value="AC">AC</option>
              <option value="Circular">Circular</option>
            </select>

            <input
              className="input"
              placeholder="From"
              value={form.from}
              onChange={(e) => handleChange('from', e.target.value)}
            />

            <input
              className="input"
              placeholder="To"
              value={form.to}
              onChange={(e) => handleChange('to', e.target.value)}
            />

            <input
              className="input"
              placeholder="Fare min"
              type="number"
              value={form.fareMin}
              onChange={(e) => handleChange('fareMin', e.target.value)}
            />

            <input
              className="input"
              placeholder="Fare max"
              type="number"
              value={form.fareMax}
              onChange={(e) => handleChange('fareMax', e.target.value)}
            />

            <input
              className="input"
              placeholder="Distance (km)"
              type="number"
              value={form.distanceKm}
              onChange={(e) => handleChange('distanceKm', e.target.value)}
            />

            <input
              className="input"
              placeholder="Stops count"
              type="number"
              value={form.stopsCount}
              onChange={(e) => handleChange('stopsCount', e.target.value)}
            />

            <input
              className="input"
              placeholder="Headway minutes"
              type="number"
              value={form.headwayMinutes}
              onChange={(e) => handleChange('headwayMinutes', e.target.value)}
            />

            <input
              className="input"
              placeholder="Buses on route"
              type="number"
              value={form.busesOnRoute}
              onChange={(e) => handleChange('busesOnRoute', e.target.value)}
            />
          </div>

          <textarea
            className="input mt-4 min-h-[120px]"
            placeholder="Path preview / stops (comma separated)"
            value={form.pathPreview}
            onChange={(e) => handleChange('pathPreview', e.target.value)}
          />

          {message ? (
            <p className="mt-3 text-sm text-primary font-medium">{message}</p>
          ) : null}

          <button className="btn-primary mt-4" onClick={handleAddRoute}>
            Add Bus Route
          </button>
        </div>

        <div className="card p-6">
          <p className="font-semibold text-ink mb-4">Existing Routes</p>

          <div className="space-y-3">
            {routes.map((route) => (
              <div
                key={route.id}
                className="flex items-center justify-between gap-4 border border-border rounded-xl p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {route.routeNo} · {route.from} → {route.to}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {route.category} · ₹{route.fareMin}–₹{route.fareMax}
                  </p>
                </div>

                <button
                  onClick={() => deleteRoute(route.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}