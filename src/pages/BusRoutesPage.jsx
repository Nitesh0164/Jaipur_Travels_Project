import { useState, useMemo } from 'react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import RouteCard from '../components/bus/RouteCard'
import { useBusStore } from '../store/useBusStore'

const FILTERS = ['All', 'Urban', 'Sub-Urban', 'AC', 'Circular']

export default function BusRoutesPage() {
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')

  const routes = useBusStore((state) => state.routes) || []
  const networkInfo = useBusStore((state) => state.networkInfo) || {}

  const filteredRoutes = useMemo(() => {
    if (activeFilter === 'All') return routes
    return routes.filter((route) => route.category === activeFilter)
  }, [routes, activeFilter])

  const totalRoutes = routes.length

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🚌 Jaipur Bus Network</h1>
          <p className="text-sm text-white/80 mb-4">
            Smart routes, affordable travel, and easy planning across Jaipur.
          </p>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {totalRoutes} Routes
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {networkInfo.totalBuses ?? 0} Buses
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {networkInfo.hours ?? 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 space-y-5">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`chip ${activeFilter === filter ? 'chip-active' : ''}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {!selectedRoute && (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onClick={() => setSelectedRoute(route)}
              />
            ))}
          </div>
        )}

        {selectedRoute && (
          <div className="card p-5 space-y-4">
            <button
              onClick={() => setSelectedRoute(null)}
              className="text-sm text-primary"
            >
              ← Back
            </button>

            <h2 className="text-xl font-bold">Bus {selectedRoute.routeNo}</h2>

            <p className="text-sm text-ink-muted">
              {selectedRoute.from} → {selectedRoute.to}
            </p>

            <div className="space-y-2 mt-4">
              {(selectedRoute.pathPreview || []).map((stop, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-sm">{stop}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mt-4">
              <div className="card p-3">🚏 Stops: {selectedRoute.stopsCount ?? 0}</div>
              <div className="card p-3">📏 {selectedRoute.distanceKm ?? 0} km</div>
              <div className="card p-3">
                💰 ₹{selectedRoute.fareMin ?? 0}–₹{selectedRoute.fareMax ?? 0}
              </div>
              <div className="card p-3">
                ⏱ Every {selectedRoute.headwayMinutes ?? 0} min
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}