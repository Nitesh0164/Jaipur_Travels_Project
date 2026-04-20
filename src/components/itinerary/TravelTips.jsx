import { Lightbulb } from 'lucide-react'

export default function TravelTips({ tips }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={16} className="text-amber-500" />
        <h3 className="font-bold text-ink">Travel Tips</h3>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-3 text-sm text-ink-muted leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}
