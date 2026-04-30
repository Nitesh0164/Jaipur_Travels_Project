import { useState, useMemo, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import RouteCard from '../components/bus/RouteCard'
import SkeletonCard from '../components/ui/SkeletonCard'
import { useBusStore } from '../store/useBusStore'
import { get } from '../lib/api'

const FILTERS = ['All', 'Urban', 'Sub-Urban', 'AC', 'Circular']

export default function BusRoutesPage() {
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')

  // Route Planner State
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [result, setResult] = useState(null)
  const [activeField, setActiveField] = useState(null)
  const [activeTab, setActiveTab] = useState('planner') // 'planner' or 'routes'
  const [planningLoading, setPlanningLoading] = useState(false)

  // Autocomplete suggestions from backend
  const [suggestions, setSuggestions] = useState([])

  const { routes, networkInfo, loading, fetchRoutes, planRoute } = useBusStore()

  // Fetch routes on mount
  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  const filteredRoutes = useMemo(() => {
    if (activeFilter === 'All') return routes
    return routes.filter((route) => route.category === activeFilter)
  }, [routes, activeFilter])

  const totalRoutes = routes.length

  // Autocomplete via backend
  useEffect(() => {
    const query = activeField === 'source' ? source : activeField === 'destination' ? destination : ''
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const data = await get(`/api/buses/stops/suggest?q=${encodeURIComponent(query.trim())}`, { auth: false })
        setSuggestions((data ?? []).map((name) => ({ name, source: 'Bus Stop' })))
      } catch {
        setSuggestions([])
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [source, destination, activeField])

  const handlePlan = async () => {
    if (!source.trim() || !destination.trim()) return
    setPlanningLoading(true)
    const data = await planRoute(source.trim(), destination.trim())
    setPlanningLoading(false)
    if (data) {
      setResult(data)
    }
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-6 relative overflow-hidden">
        <div className="absolute inset-0 mahal-pattern opacity-20" />
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-3xl font-bold mb-2">🚌 Jaipur Bus Network</h1>
          <p className="text-sm text-white/90 mb-4">
            Smart routes, affordable travel, and easy planning across Jaipur.
          </p>

          <div className="flex flex-wrap gap-3 text-xs font-bold">
            <span className="glass-panel text-white px-3 py-1 rounded-full shadow-sm">
              {totalRoutes} Routes
            </span>
            <span className="glass-panel text-white px-3 py-1 rounded-full shadow-sm">
              {networkInfo.totalBuses ?? 0} Buses
            </span>
            <span className="glass-panel text-white px-3 py-1 rounded-full shadow-sm">
              {networkInfo.hours ?? 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 space-y-6">
        
        {/* Tabs */}
        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-border">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'planner' ? 'bg-primary text-white shadow-md' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Route Planner
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'routes' ? 'bg-primary text-white shadow-md' : 'text-ink-muted hover:text-ink'
            }`}
          >
            All Bus Routes
          </button>
        </div>

        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="card p-6 border-l-4 border-l-primary">
              <h2 className="text-xl font-bold text-ink mb-4">Find Your Bus</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-black uppercase text-ink-muted mb-1.5">From</label>
                  <input
                    className="input font-bold"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    onFocus={() => setActiveField('source')}
                    placeholder="e.g. Hawa Mahal, Ajmeri Gate"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-black uppercase text-ink-muted mb-1.5">To</label>
                  <input
                    className="input font-bold"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onFocus={() => setActiveField('destination')}
                    placeholder="e.g. Amer Fort, Jal Mahal"
                  />
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-4 border-2 border-border rounded-xl bg-white overflow-hidden shadow-lg relative z-20">
                  {suggestions.map((item, index) => (
                    <button
                      key={`${item.name}-${index}`}
                      onClick={() => {
                        if (activeField === 'source') setSource(item.name)
                        if (activeField === 'destination') setDestination(item.name)
                        setActiveField(null)
                        setSuggestions([])
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-sand border-b border-border last:border-b-0"
                    >
                      <p className="font-bold text-ink">{item.name}</p>
                      <p className="text-xs text-ink-muted font-semibold uppercase tracking-wide">
                        {item.source}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={handlePlan} disabled={planningLoading} className="btn-primary w-full md:w-auto">
                  {planningLoading ? 'Searching...' : 'Find Best Route'}
                </button>

                <button
                  onClick={() => {
                    setSource('')
                    setDestination('')
                    setResult(null)
                    setActiveField(null)
                    setSuggestions([])
                  }}
                  className="btn-secondary w-full md:w-auto"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* ── Results from RoutePlanResponse ── */}
            {result && (
              <div className="space-y-6 animate-fade-up">
                <div className="card p-5 bg-sand/50">
                  <h3 className="text-lg font-bold text-ink mb-2">Route Summary</h3>
                  <p className="text-sm text-ink-muted font-medium mb-4">{result.summary || `Routes from ${result.source} to ${result.destination}`}</p>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white border-2 border-border rounded-xl p-4 shadow-sm">
                      <p className="text-ink-faint text-xs font-bold uppercase mb-1">Boarding From</p>
                      <p className="font-black text-ink">{result.source || 'N/A'}</p>
                    </div>

                    <div className="bg-white border-2 border-border rounded-xl p-4 shadow-sm">
                      <p className="text-ink-faint text-xs font-bold uppercase mb-1">Destination</p>
                      <p className="font-black text-ink">{result.destination || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Direct routes */}
                {result.directRoutes?.length > 0 && (
                  <div className="card p-6 border-t-4 border-t-secondary">
                    <h3 className="text-lg font-black text-ink mb-4 flex items-center gap-2">✅ Direct Bus Available</h3>

                    <div className="space-y-4">
                      {result.directRoutes.map((route, index) => (
                        <div key={`${route.routeNo}-${index}`} className="border-2 border-border rounded-xl p-5 hover:shadow-3d hover:-translate-y-1 transition-all duration-300">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                              <p className="font-black text-xl text-ink">Bus {route.routeNo}</p>
                              <p className="text-sm font-semibold text-ink-muted">
                                {route.from} → {route.to}
                              </p>
                            </div>
                            <span className="badge bg-secondary/10 text-secondary border-secondary">Direct Route</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-sand p-3 rounded-lg"><p className="text-ink-faint text-[10px] font-bold uppercase mb-1">Stops to Travel</p><p className="font-bold text-ink">{route.stopsToTravel}</p></div>
                            <div className="bg-sand p-3 rounded-lg"><p className="text-ink-faint text-[10px] font-bold uppercase mb-1">Fare</p><p className="font-bold text-ink">₹{route.fareMin}–₹{route.fareMax}</p></div>
                            <div className="bg-sand p-3 rounded-lg"><p className="text-ink-faint text-[10px] font-bold uppercase mb-1">Route</p><p className="font-bold text-ink">{route.routeType}</p></div>
                            <div className="bg-sand p-3 rounded-lg"><p className="text-ink-faint text-[10px] font-bold uppercase mb-1">Via Stops</p><p className="font-bold text-ink text-xs">{(route.stopsOnWay ?? []).slice(0,3).join(' → ') || 'N/A'}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* One-change routes */}
                {(result.directRoutes?.length === 0) && result.oneChangeRoutes?.length > 0 && (
                  <div className="card p-6 border-t-4 border-t-accent">
                    <h3 className="text-lg font-black text-ink mb-4 flex items-center gap-2">🔁 Connected Route (1 Change)</h3>

                    <div className="space-y-6">
                      {result.oneChangeRoutes.slice(0, 2).map((option, index) => (
                        <div key={`${option.firstLeg?.routeNo}-${option.secondLeg?.routeNo}-${index}`} className="border-2 border-border rounded-xl p-5 hover:shadow-3d hover:-translate-y-1 transition-all duration-300">
                          
                          <div className="mb-4 pb-4 border-b-2 border-border border-dashed">
                            <p className="font-bold text-ink">Directions:</p>
                            <p className="text-sm font-medium text-ink-muted mt-1 leading-relaxed">
                              First, take <strong className="text-ink">Bus {option.firstLeg?.routeNo}</strong> and get down at <strong className="text-primary">{option.interchangeStop}</strong>. 
                              From there, change to <strong className="text-ink">Bus {option.secondLeg?.routeNo}</strong> to reach your destination.
                            </p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-sand rounded-xl p-4">
                              <p className="text-[10px] font-black uppercase text-accent-dark mb-1">Step 1</p>
                              <p className="font-black text-lg text-ink">Bus {option.firstLeg?.routeNo}</p>
                              <p className="text-sm font-semibold text-ink-muted mt-1">
                                {option.firstLeg?.from} → <span className="text-primary">{option.interchangeStop}</span>
                              </p>
                            </div>

                            <div className="bg-sand rounded-xl p-4">
                              <p className="text-[10px] font-black uppercase text-accent-dark mb-1">Step 2</p>
                              <p className="font-black text-lg text-ink">Bus {option.secondLeg?.routeNo}</p>
                              <p className="text-sm font-semibold text-ink-muted mt-1">
                                <span className="text-primary">{option.interchangeStop}</span> → {option.secondLeg?.to}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-4 text-sm font-bold bg-primary/5 p-3 rounded-lg border border-primary/20">
                            <p className="text-primary-dark">Total Approx Fare: ₹{option.estimatedFareMin}–₹{option.estimatedFareMax}</p>
                            <p className="text-ink-muted">Total Stops: {option.totalStops}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No routes found */}
                {(!result.directRoutes || result.directRoutes.length === 0) && (!result.oneChangeRoutes || result.oneChangeRoutes.length === 0) && (
                  <div className="card p-5 border-l-4 border-l-red-500">
                    <p className="text-sm font-semibold text-ink">
                      Couldn't find a direct or 1-change route. Try using major landmarks like Hawa Mahal, Amer Fort, or Sindhi Camp.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="space-y-5 animate-fade-up">
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

            {loading && routes.length === 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} height="h-32" lines={2} />
                ))}
              </div>
            ) : (
              <>
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
                  <div className="card p-6 space-y-4 shadow-3d -translate-y-1">
                    <button
                      onClick={() => setSelectedRoute(null)}
                      className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
                    >
                      ← Back to Routes
                    </button>

                    <h2 className="text-2xl font-black">Bus {selectedRoute.routeNo}</h2>
                    <p className="text-sm font-semibold text-ink-muted">
                      {selectedRoute.from} → {selectedRoute.to}
                    </p>

                    <div className="space-y-3 mt-6 bg-sand p-4 rounded-xl border border-border">
                      <p className="text-xs font-black uppercase text-ink-muted mb-2">Key Stops</p>
                      {(selectedRoute.pathPreview || []).map((stop, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-primary rounded-full shadow-sm" />
                          <span className="text-sm font-bold text-ink">{stop}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                      <div className="bg-white border-2 border-border p-4 rounded-xl font-bold shadow-sm">🚏 Stops: {selectedRoute.stopsCount ?? 0}</div>
                      <div className="bg-white border-2 border-border p-4 rounded-xl font-bold shadow-sm">📏 Distance: {selectedRoute.distanceKm ?? 0} km</div>
                      <div className="bg-white border-2 border-border p-4 rounded-xl font-bold shadow-sm">💰 Fare: ₹{selectedRoute.fareMin ?? 0}–₹{selectedRoute.fareMax ?? 0}</div>
                      <div className="bg-white border-2 border-border p-4 rounded-xl font-bold shadow-sm">⏱ Every: {selectedRoute.headwayMinutes ?? 0} min</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}