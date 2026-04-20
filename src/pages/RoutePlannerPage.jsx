import { useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { useBusStore } from '../store/useBusStore'
import { usePlacesStore } from '../store/usePlacesStore'
import {
  getLocationSuggestions,
  planBusJourney,
} from '../utils/routePlanner'

export default function RoutePlannerPage() {
  const { routes } = useBusStore()
  const { places } = usePlacesStore()

  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [result, setResult] = useState(null)
  const [activeField, setActiveField] = useState(null)

  const sourceSuggestions = useMemo(() => {
    return source.trim()
      ? getLocationSuggestions(source, routes, places)
      : []
  }, [source, routes, places])

  const destinationSuggestions = useMemo(() => {
    return destination.trim()
      ? getLocationSuggestions(destination, routes, places)
      : []
  }, [destination, routes, places])

  const handlePlan = () => {
    if (!source.trim() || !destination.trim()) return
    const output = planBusJourney(source, destination, routes, places)
    setResult(output)
  }

  const suggestions =
    activeField === 'source'
      ? sourceSuggestions
      : activeField === 'destination'
      ? destinationSuggestions
      : []

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🧭 Bus Route Planner</h1>
          <p className="text-sm text-white/80">
            Find the best Jaipur bus route between two places, including direct and one-change options.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 space-y-6">
        <div className="card p-5">
          <h2 className="text-xl font-bold text-ink mb-4">Plan Your Journey</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-ink mb-1.5">
                From
              </label>
              <input
                className="input"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                onFocus={() => setActiveField('source')}
                placeholder="e.g. Hawa Mahal, Ajmeri Gate"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-ink mb-1.5">
                To
              </label>
              <input
                className="input"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setActiveField('destination')}
                placeholder="e.g. Amer Fort, Jal Mahal"
              />
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-4 border border-border rounded-2xl bg-white overflow-hidden">
              {suggestions.map((item, index) => (
                <button
                  key={`${item.name}-${index}`}
                  onClick={() => {
                    if (activeField === 'source') setSource(item.name)
                    if (activeField === 'destination') setDestination(item.name)
                    setActiveField(null)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-sand border-b border-border last:border-b-0"
                >
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink-muted capitalize">
                    {item.source}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={handlePlan} className="btn-primary">
              Find Bus Route
            </button>

            <button
              onClick={() => {
                setSource('')
                setDestination('')
                setResult(null)
                setActiveField(null)
              }}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="text-lg font-bold text-ink mb-2">Route Result</h3>
              <p className="text-sm text-ink-muted mb-3">{result.message}</p>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="card p-4">
                  <p className="text-ink-faint mb-1">Resolved Source</p>
                  <p className="font-semibold text-ink">
                    {result.sourceLocation?.name || 'Not found'}
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    Boarding stop: {result.sourceStop || 'Not available'}
                  </p>
                </div>

                <div className="card p-4">
                  <p className="text-ink-faint mb-1">Resolved Destination</p>
                  <p className="font-semibold text-ink">
                    {result.destinationLocation?.name || 'Not found'}
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    Get down stop: {result.destinationStop || 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            {result.directOptions.length > 0 && (
              <div className="card p-5">
                <h3 className="text-lg font-bold text-ink mb-4">✅ Direct Bus Options</h3>

                <div className="space-y-4">
                  {result.directOptions.map((option, index) => (
                    <div
                      key={`${option.routeNo}-${index}`}
                      className="border border-border rounded-2xl p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="font-bold text-ink">
                            Bus {option.routeNo}
                          </p>
                          <p className="text-sm text-ink-muted">
                            {option.fullRoute.from} → {option.fullRoute.to}
                          </p>
                        </div>

                        <span className="bg-primary-lighter text-primary text-xs font-semibold px-3 py-1 rounded-full">
                          Direct
                        </span>
                      </div>

                      <div className="grid md:grid-cols-4 gap-3 text-sm">
                        <div className="card p-3">
                          <p className="text-ink-faint mb-1">Board At</p>
                          <p className="font-medium text-ink">{option.boardAt}</p>
                        </div>

                        <div className="card p-3">
                          <p className="text-ink-faint mb-1">Get Down At</p>
                          <p className="font-medium text-ink">{option.getDownAt}</p>
                        </div>

                        <div className="card p-3">
                          <p className="text-ink-faint mb-1">Fare</p>
                          <p className="font-medium text-ink">
                            ₹{option.fareMin}–₹{option.fareMax}
                          </p>
                        </div>

                        <div className="card p-3">
                          <p className="text-ink-faint mb-1">Frequency</p>
                          <p className="font-medium text-ink">
                            {option.headwayMinutes} min
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.directOptions.length === 0 && result.oneChangeOptions.length > 0 && (
              <div className="card p-5">
                <h3 className="text-lg font-bold text-ink mb-4">🔁 One-Change Options</h3>

                <div className="space-y-4">
                  {result.oneChangeOptions.slice(0, 3).map((option, index) => (
                    <div
                      key={`${option.firstBus.routeNo}-${option.secondBus.routeNo}-${index}`}
                      className="border border-border rounded-2xl p-4"
                    >
                      <div className="mb-3">
                        <p className="font-bold text-ink">
                          Option {index + 1}
                        </p>
                        <p className="text-sm text-ink-muted">
                          Change at {option.interchangeStop}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="card p-4">
                          <p className="text-xs text-ink-faint mb-1">First Bus</p>
                          <p className="font-bold text-ink">
                            Bus {option.firstBus.routeNo}
                          </p>
                          <p className="text-sm text-ink-muted mt-1">
                            {option.firstBus.boardAt} → {option.firstBus.getDownAt}
                          </p>
                          <p className="text-xs text-ink-muted mt-2">
                            Fare: ₹{option.firstBus.fareMin}–₹{option.firstBus.fareMax}
                          </p>
                        </div>

                        <div className="card p-4">
                          <p className="text-xs text-ink-faint mb-1">Second Bus</p>
                          <p className="font-bold text-ink">
                            Bus {option.secondBus.routeNo}
                          </p>
                          <p className="text-sm text-ink-muted mt-1">
                            {option.secondBus.boardAt} → {option.secondBus.getDownAt}
                          </p>
                          <p className="text-xs text-ink-muted mt-2">
                            Fare: ₹{option.secondBus.fareMin}–₹{option.secondBus.fareMax}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                        <div className="card p-3">
                          <p className="text-ink-faint mb-1">Approx Total Fare</p>
                          <p className="font-medium text-ink">
                            ₹{option.totalApproxFareMin}–₹{option.totalApproxFareMax}
                          </p>
                        </div>

                        <div className="card p-3">
                          <p className="text-ink-faint mb-1">Total Stops</p>
                          <p className="font-medium text-ink">
                            {option.totalStops}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!result.success && (
              <div className="card p-5">
                <p className="text-sm text-ink-muted">
                  Try using well-known Jaipur landmarks like Hawa Mahal, Badi Chaupar, Ajmeri Gate, Jal Mahal, Amer Fort, City Palace, etc.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}