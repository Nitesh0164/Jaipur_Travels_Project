export default function RouteCard({ route, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card p-4 cursor-pointer hover:shadow-lift hover:scale-[1.02] transition-all duration-200"
    >
      <div className="flex justify-between mb-2">
        <h3 className="font-bold text-lg text-ink">
          🚌 {route.routeNo}
        </h3>

        <span className="text-xs bg-primary-lighter px-2 py-1 rounded">
          {route.category}
        </span>
      </div>

      <p className="text-sm text-ink-muted mb-2">
        {route.from} → {route.to}
      </p>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-accent-light px-2 py-1 rounded">
          ₹{route.fareMin}–₹{route.fareMax}
        </span>
        <span className="bg-border px-2 py-1 rounded">
          {route.distanceKm} km
        </span>
        <span className="bg-border px-2 py-1 rounded">
          {route.stopsCount} stops
        </span>
      </div>
    </div>
  )
}