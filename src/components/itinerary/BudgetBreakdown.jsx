import { fmt } from '../../utils/formatCurrency'
import { BUDGET_COLORS, BUDGET_ICONS, BUDGET_LABELS } from '../../utils/budgetCalculator'

export default function BudgetBreakdown({ budget }) {
  const total = Object.values(budget).reduce((s, v) => s + v, 0)
  const entries = Object.entries(budget)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-ink">Budget Breakdown</h3>
        <div>
          <p className="text-[11px] text-ink-faint text-right">Total estimated</p>
          <p className="text-xl font-bold text-primary text-right">{fmt(total)}</p>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex rounded-xl overflow-hidden h-3 mb-5 gap-0.5">
        {entries.map(([key, val]) => (
          <div
            key={key}
            className={`${BUDGET_COLORS[key]?.bar ?? 'bg-gray-300'} transition-all`}
            style={{ width: `${(val / total * 100).toFixed(1)}%` }}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${BUDGET_COLORS[key]?.bg ?? 'bg-gray-100'}`}>
              {BUDGET_ICONS[key]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-ink">{BUDGET_LABELS[key] ?? key}</p>
                <p className={`text-sm font-bold ${BUDGET_COLORS[key]?.text ?? 'text-ink'}`}>{fmt(val)}</p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${BUDGET_COLORS[key]?.bar ?? 'bg-gray-300'} rounded-full budget-bar-fill`}
                  style={{ width: `${(val / total * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
