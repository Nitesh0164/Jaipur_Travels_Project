import { useTripStore } from '../../store/useTripStore'
import { fmt } from '../../utils/formatCurrency'

export default function TripSummaryCard() {
  const { prefs } = useTripStore()
  const estimated = Math.round(prefs.budget * 0.88 * prefs.days)

  const rows = [
    { k: 'City',         v: 'Jaipur, Rajasthan' },
    { k: 'Days',         v: `${prefs.days} ${prefs.days === 1 ? 'Day' : 'Days'}` },
    { k: 'Budget',       v: `${fmt(prefs.budget)} / day` },
    { k: 'Travel Style', v: prefs.travelStyle },
    { k: 'Stay',         v: prefs.stay },
    { k: 'Transport',    v: prefs.transport },
    { k: 'Interests',    v: prefs.interests.slice(0,3).join(', ') + (prefs.interests.length > 3 ? ` +${prefs.interests.length-3}` : '') || '—' },
  ]

  return (
    <div className="card p-5 sticky top-20">
      <h3 className="font-bold text-ink mb-4">Trip Summary</h3>
      <div className="space-y-2.5">
        {rows.map(r => (
          <div key={r.k} className="flex items-start justify-between gap-3">
            <p className="text-xs text-ink-muted shrink-0">{r.k}</p>
            <p className="text-xs font-semibold text-ink text-right">{r.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-border">
        <div className="bg-primary-lighter rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Estimated Total</p>
          <p className="text-2xl font-bold text-primary">{fmt(estimated)}</p>
          <p className="text-[11px] text-ink-muted mt-0.5">for {prefs.days} days · {prefs.travelStyle}</p>
        </div>
      </div>
    </div>
  )
}
