// SkeletonCard.jsx
export function SkeletonCard({ lines = 3, height = 'h-48' }) {
  return (
    <div className="card overflow-hidden">
      <div className={`skeleton ${height} w-full`} />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        {Array.from({ length: lines - 2 }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-full rounded" />
        ))}
      </div>
    </div>
  )
}

// EmptyState.jsx
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">{icon || '🔍'}</div>
      <h3 className="font-semibold text-ink text-lg mb-2">{title}</h3>
      {description && <p className="text-ink-muted text-sm max-w-xs leading-relaxed mb-6">{description}</p>}
      {action}
    </div>
  )
}
