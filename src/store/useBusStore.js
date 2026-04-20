import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_BUS_ROUTES, BUS_NETWORK_INFO } from '../data/mockBusRoutes'

export const useBusStore = create(
  persist(
    (set, get) => ({
      networkInfo: BUS_NETWORK_INFO,
      routes: MOCK_BUS_ROUTES,

      addRoute: (route) => {
        const newRoute = {
          id:
            route.id ||
            `${String(route.routeNo || 'route')
              .toLowerCase()
              .replace(/\s+/g, '-')}-${Date.now()}`,
          routeNo: route.routeNo || '',
          routeType: route.routeType || 'Regular',
          category: route.category || 'Urban',
          from: route.from || '',
          to: route.to || '',
          viaSummary: Array.isArray(route.viaSummary) ? route.viaSummary : [],
          distanceKm: Number(route.distanceKm || 0),
          stopsCount: Number(route.stopsCount || 0),
          headwayMinutes: Number(route.headwayMinutes || 0),
          busesOnRoute: Number(route.busesOnRoute || 0),
          fareMin: Number(route.fareMin || 0),
          fareMax: Number(route.fareMax || 0),
          pathPreview: Array.isArray(route.pathPreview) ? route.pathPreview : [],
        }

        set((state) => ({
          routes: [newRoute, ...state.routes],
        }))

        return { success: true, route: newRoute }
      },

      updateRoute: (id, updates) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.id === id
              ? {
                  ...route,
                  ...updates,
                  distanceKm:
                    updates.distanceKm !== undefined
                      ? Number(updates.distanceKm || 0)
                      : route.distanceKm,
                  stopsCount:
                    updates.stopsCount !== undefined
                      ? Number(updates.stopsCount || 0)
                      : route.stopsCount,
                  headwayMinutes:
                    updates.headwayMinutes !== undefined
                      ? Number(updates.headwayMinutes || 0)
                      : route.headwayMinutes,
                  busesOnRoute:
                    updates.busesOnRoute !== undefined
                      ? Number(updates.busesOnRoute || 0)
                      : route.busesOnRoute,
                  fareMin:
                    updates.fareMin !== undefined
                      ? Number(updates.fareMin || 0)
                      : route.fareMin,
                  fareMax:
                    updates.fareMax !== undefined
                      ? Number(updates.fareMax || 0)
                      : route.fareMax,
                }
              : route
          ),
        }))

        return { success: true }
      },

      deleteRoute: (id) => {
        set((state) => ({
          routes: state.routes.filter((route) => route.id !== id),
        }))

        return { success: true }
      },

      getRouteById: (id) => {
        return get().routes.find((route) => route.id === id)
      },

      getRoutesByCategory: (category) => {
        return get().routes.filter(
          (route) =>
            String(route.category).toLowerCase() ===
            String(category).toLowerCase()
        )
      },

      updateNetworkInfo: (updates) => {
        set((state) => ({
          networkInfo: {
            ...state.networkInfo,
            ...updates,
          },
        }))
      },

      resetRoutes: () => {
        set({
          networkInfo: BUS_NETWORK_INFO,
          routes: MOCK_BUS_ROUTES,
        })
      },
    }),
    {
      name: 'complete-jaipur-buses',
    }
  )
)