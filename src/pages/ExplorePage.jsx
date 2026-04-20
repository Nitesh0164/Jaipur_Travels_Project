import { useState, useMemo } from 'react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { PlaceCard, FilterBar, SearchBar } from '../components/explore/PlaceCard'
import PlaceDetailModal from '../components/explore/PlaceDetailModal'
import { EmptyState } from '../components/ui/EmptyState'
import { useUIStore } from '../store/useUIStore'
import { usePlacesStore } from '../store/usePlacesStore'
import { motion } from 'framer-motion'

const FILTERS = ['All', 'Heritage', 'Food', 'Cafes', 'Shopping', 'Hidden Gems', 'Photography']

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setFilter] = useState('All')
  const [selectedPlace, setSelected] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { showToast } = useUIStore()
  const { places } = usePlacesStore()

  const filtered = useMemo(() => {
    let list = places

    if (activeFilter !== 'All') {
      list = list.filter(
        (p) =>
          p.category === activeFilter ||
          (Array.isArray(p.tags) && p.tags.includes(activeFilter))
      )
    }

    if (query.trim()) {
      const q = query.toLowerCase()

      list = list.filter((p) => {
        const name = String(p.name || '').toLowerCase()
        const shortDesc = String(p.shortDesc || '').toLowerCase()
        const area = String(p.area || '').toLowerCase()
        const tags = Array.isArray(p.tags) ? p.tags : []

        return (
          name.includes(q) ||
          shortDesc.includes(q) ||
          area.includes(q) ||
          tags.some((t) => String(t).toLowerCase().includes(q))
        )
      })
    }

    return list
  }, [places, query, activeFilter])

  const handleView = (place) => {
    setSelected(place)
    setModalOpen(true)
  }

  const handleAdd = (place) => {
    showToast({
      message: `✅ ${place.name} added to your trip!`,
      type: 'success',
    })
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="max-w-6xl mx-auto w-full px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">
            Explore Jaipur
          </h1>
          <p className="text-ink-muted text-sm">
            {places.length}+ handpicked places — heritage forts, hidden cafes, and everything in between.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col gap-3 mb-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search places, areas, or categories…"
          />

          <FilterBar
            filters={FILTERS}
            active={activeFilter}
            onChange={setFilter}
          />
        </div>

        {/* Results count */}
        <p className="text-xs text-ink-faint mb-4 font-medium">
          {filtered.length} place{filtered.length !== 1 ? 's' : ''} found
          {activeFilter !== 'All' ? ` in ${activeFilter}` : ''}
          {query ? ` matching "${query}"` : ''}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No places found"
            description="Try a different search term or remove a filter."
            action={
              <button
                onClick={() => {
                  setQuery('')
                  setFilter('All')
                }}
                className="btn-secondary"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((place, i) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <PlaceCard
                  place={place}
                  onView={() => handleView(place)}
                  onAdd={() => handleAdd(place)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Place detail modal */}
      <PlaceDetailModal
        place={selectedPlace}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setTimeout(() => setSelected(null), 300)
        }}
      />

      <BottomNav />
    </div>
  )
}