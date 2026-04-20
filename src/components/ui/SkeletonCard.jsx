export default function SkeletonCard({ lines = 3, height = 'h-40' }) {
  return (
    <div className="card overflow-hidden">
      <div className={`skeleton ${height} w-full rounded-none`} />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        {Array.from({ length: Math.max(0, lines - 2) }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
