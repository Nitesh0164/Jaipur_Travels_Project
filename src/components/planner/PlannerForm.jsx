import { getCityConfig } from '../../data/cityConfig'

const cfg = getCityConfig('jaipur')

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-ink mb-1.5">{label}</label>
    {children}
  </div>
)

export default function PlannerForm({ value, onChange }) {
  const prefs = value

  const setPrefs = (updates) => {
    onChange({
      ...prefs,
      ...updates,
    })
  }

  const toggleInterest = (interest) => {
    const current = prefs.interests || []
    const exists = current.includes(interest)

    setPrefs({
      interests: exists
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    })
  }

  return (
    <div className="space-y-5">
      {/* City + Days + Budget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="City">
          <input
            type="text"
            className="input"
            value={prefs.city || 'Jaipur'}
            onChange={(e) => setPrefs({ city: e.target.value })}
            placeholder="Jaipur"
          />
        </Field>

        <Field label="Number of Days">
          <select
            className="select"
            value={prefs.days}
            onChange={(e) => setPrefs({ days: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5, 7].map((d) => (
              <option key={d} value={d}>
                {d} {d === 1 ? 'Day' : 'Days'}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Total Budget (₹)">
          <input
            type="number"
            className="input"
            value={prefs.budget}
            onChange={(e) => setPrefs({ budget: Number(e.target.value) || 0 })}
            min={500}
            step={500}
          />
        </Field>
      </div>

      {/* Travel style */}
      <Field label="Travel Style">
        <div className="flex flex-wrap gap-2">
          {cfg.travelStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setPrefs({ travelStyle: style })}
              className={`chip ${prefs.travelStyle === style ? 'chip-active' : ''}`}
            >
              {style}
            </button>
          ))}
        </div>
      </Field>

      {/* Interests */}
      <Field label="Interests (pick any)">
        <div className="flex flex-wrap gap-2">
          {cfg.categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleInterest(category)}
              className={`chip ${prefs.interests?.includes(category) ? 'chip-active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </Field>

      {/* Stay + Transport */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Stay Preference">
          <select
            className="select"
            value={prefs.stayPreference}
            onChange={(e) => setPrefs({ stayPreference: e.target.value })}
          >
            {cfg.stayOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Transport Preference">
          <select
            className="select"
            value={prefs.transportPreference}
            onChange={(e) => setPrefs({ transportPreference: e.target.value })}
          >
            {cfg.transports.map((transport) => (
              <option key={transport} value={transport}>
                {transport}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Pace */}
      <Field label="Trip Pace">
        <div className="flex flex-col gap-2">
          {cfg.paceOptions.map((pace) => (
            <label
              key={pace}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                prefs.pace === pace
                  ? 'border-primary bg-primary-lighter'
                  : 'border-border hover:border-border-strong'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  prefs.pace === pace ? 'border-primary' : 'border-border-strong'
                }`}
              >
                {prefs.pace === pace && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>

              <input
                type="radio"
                className="hidden"
                value={pace}
                checked={prefs.pace === pace}
                onChange={() => setPrefs({ pace })}
              />

              <span className="text-sm font-medium text-ink capitalize">{pace}</span>
            </label>
          ))}
        </div>
      </Field>
    </div>
  )
}