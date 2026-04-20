import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_PLACES } from '../data/mockPlaces'

export const usePlacesStore = create(
  persist(
    (set, get) => ({
      places: MOCK_PLACES,

      addPlace: (place) => {
        const newPlace = {
          id:
            place.id ||
            `${String(place.name || 'place')
              .toLowerCase()
              .replace(/\s+/g, '-')}-${Date.now()}`,
          name: place.name || '',
          category: place.category || 'Heritage',
          area: place.area || '',
          tagline: place.tagline || '',
          shortDesc: place.shortDesc || '',
          overview: place.overview || '',
          entryFee: Number(place.entryFee || 0),
          estimatedSpend: Number(place.estimatedSpend || 0),
          duration: place.duration || '1 hr',
          bestTime: place.bestTime || '',
          openHours: place.openHours || '',
          rating: Number(place.rating || 4.2),
          reviews: Number(place.reviews || 0),
          mustSee: Boolean(place.mustSee),
          image: place.image || '/images/places/fallback.jpg',
          tags: Array.isArray(place.tags) ? place.tags : [],
          nearby: Array.isArray(place.nearby) ? place.nearby : [],
          nearbyFood: Array.isArray(place.nearbyFood) ? place.nearbyFood : [],
          tip: place.tip || '',
        }

        set((state) => ({
          places: [newPlace, ...state.places],
        }))

        return { success: true, place: newPlace }
      },

      updatePlace: (id, updates) => {
        set((state) => ({
          places: state.places.map((place) =>
            place.id === id
              ? {
                  ...place,
                  ...updates,
                  entryFee:
                    updates.entryFee !== undefined
                      ? Number(updates.entryFee || 0)
                      : place.entryFee,
                  estimatedSpend:
                    updates.estimatedSpend !== undefined
                      ? Number(updates.estimatedSpend || 0)
                      : place.estimatedSpend,
                  rating:
                    updates.rating !== undefined
                      ? Number(updates.rating || 0)
                      : place.rating,
                  reviews:
                    updates.reviews !== undefined
                      ? Number(updates.reviews || 0)
                      : place.reviews,
                }
              : place
          ),
        }))

        return { success: true }
      },

      deletePlace: (id) => {
        set((state) => ({
          places: state.places.filter((place) => place.id !== id),
        }))

        return { success: true }
      },

      getPlaceById: (id) => {
        return get().places.find((place) => place.id === id)
      },

      getPlacesByCategory: (category) => {
        return get().places.filter(
          (place) =>
            String(place.category).toLowerCase() ===
            String(category).toLowerCase()
        )
      },

      resetPlaces: () => {
        set({ places: MOCK_PLACES })
      },
    }),
    {
      name: 'complete-jaipur-places',
    }
  )
)