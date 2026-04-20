import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { usePlacesStore } from '../store/usePlacesStore'
import { useUIStore } from '../store/useUIStore'
const INITIAL_FORM = {
  name: '',
  category: 'Heritage',
  area: '',
  image: '',
  entryFee: '',
  estimatedSpend: '',
  shortDesc: '',
}

export default function AdminPlacesPage() {
  const navigate = useNavigate()
  const { addPlace, places, deletePlace } = usePlacesStore()
  const { showToast } = useUIStore()
  const [form, setForm] = useState(INITIAL_FORM)
  const [message, setMessage] = useState('')

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddPlace = () => {
  if (!form.name.trim() || !form.category.trim() || !form.area.trim()) {
    setMessage('Please fill Place name, Category, and Area.')

    showToast({
      message: '⚠️ Please fill required fields',
      type: 'error',
    })

    return
  }

  addPlace({
    name: form.name,
    category: form.category,
    area: form.area,
    image: form.image || '/images/places/fallback.jpg',
    entryFee: Number(form.entryFee || 0),
    estimatedSpend: Number(form.estimatedSpend || 0),
    shortDesc: form.shortDesc,
  })

  setMessage('Place added successfully.')

  showToast({
    message: '🎉 Place added successfully!',
    type: 'success',
  })

  setForm(INITIAL_FORM)
}

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-24 md:pb-8">
        <button
          onClick={() => navigate('/admin')}
          className="text-sm text-primary mb-4"
        >
          ← Back to Admin Dashboard
        </button>

        <h1 className="font-display text-3xl font-bold text-ink mb-2">
          Manage Places
        </h1>
        <p className="text-sm text-ink-muted mb-6">
          Add and manage Jaipur places, cafes, heritage spots, and markets.
        </p>

        <div className="card p-6 mb-8">
          <p className="font-semibold text-ink mb-3">Add New Place</p>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="input"
              placeholder="Place name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />

            <select
              className="select"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="Heritage">Heritage</option>
              <option value="Food">Food</option>
              <option value="Cafes">Cafes</option>
              <option value="Shopping">Shopping</option>
              <option value="Hidden Gems">Hidden Gems</option>
            </select>

            <input
              className="input"
              placeholder="Area"
              value={form.area}
              onChange={(e) => handleChange('area', e.target.value)}
            />

            <input
              className="input"
              placeholder="Image URL or path"
              value={form.image}
              onChange={(e) => handleChange('image', e.target.value)}
            />

            <input
              className="input"
              placeholder="Entry fee"
              type="number"
              value={form.entryFee}
              onChange={(e) => handleChange('entryFee', e.target.value)}
            />

            <input
              className="input"
              placeholder="Estimated spend"
              type="number"
              value={form.estimatedSpend}
              onChange={(e) => handleChange('estimatedSpend', e.target.value)}
            />
          </div>

          <textarea
            className="input mt-4 min-h-[120px]"
            placeholder="Short description"
            value={form.shortDesc}
            onChange={(e) => handleChange('shortDesc', e.target.value)}
          />

          {message ? (
            <p className="mt-3 text-sm text-primary font-medium">{message}</p>
          ) : null}

          <button className="btn-primary mt-4" onClick={handleAddPlace}>
            Add Place
          </button>
        </div>

        <div className="card p-6">
          <p className="font-semibold text-ink mb-4">Existing Places</p>

          <div className="space-y-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between gap-4 border border-border rounded-xl p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{place.name}</p>
                  <p className="text-sm text-ink-muted">
                    {place.category} · {place.area}
                  </p>
                </div>

                <button
                  onClick={() => deletePlace(place.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}