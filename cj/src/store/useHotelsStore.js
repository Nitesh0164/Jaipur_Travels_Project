import { create } from 'zustand';
import { hotelApi } from '../services/hotelApi';

const DEFAULT_FILTERS = {
  searchText: '',
  area: '',
  budgetMin: '',
  budgetMax: '',
  rating: '',
  checkIn: '',
  checkOut: '',
  adults: 2,
  rooms: 1,
  children: 0,
  currency: 'INR',
  maxPages: 5,
  tax: true,
};

export const useHotelsStore = create((set, get) => ({
  hotels: [],
  loading: false,
  error: null,
  warning: null,
  totalHotelCount: 0,
  totalPagesFetched: 0,
  totalResultsReturned: 0,
  selectedHotel: null,
  filters: { ...DEFAULT_FILTERS },

  setFilters: (partial) =>
    set((s) => ({ filters: { ...s.filters, ...partial } })),

  clearError: () => set({ error: null, warning: null }),

  resetFilters: () => set({ 
    filters: { ...DEFAULT_FILTERS }, 
    hotels: [], 
    totalHotelCount: 0,
    totalPagesFetched: 0,
    totalResultsReturned: 0,
  }),

  // ── Primary: Live MakCorps city search ─────────────────────────────

  /**
   * Calls POST /api/hotels/live-city-search.
   * Uses current filter state; caller can optionally override specific fields.
   */
  searchLive: async (overrides = {}) => {
    const filters = { ...get().filters, ...overrides };
    
    if (!filters.checkIn || !filters.checkOut) {
      set({
        warning: 'Please select check-in and check-out dates to fetch live hotel prices.',
      });
      return;
    }

    set({ loading: true, error: null, warning: null, hotels: [] });

    try {
      const payload = {
        city: 'Jaipur',
        cityId: '',
        checkIn:  filters.checkIn,
        checkOut: filters.checkOut,
        adults:   Number(filters.adults)   || 2,
        rooms:    Number(filters.rooms)    || 1,
        children: Number(filters.children) || 0,
        currency: filters.currency || 'INR',
        tax:      filters.tax !== undefined ? filters.tax : true,
        maxPages: Number(filters.maxPages) || 5,
        budgetMin:  filters.budgetMin  !== '' ? Number(filters.budgetMin)  : null,
        budgetMax:  filters.budgetMax  !== '' ? Number(filters.budgetMax)  : null,
        rating:     filters.rating     !== '' ? Number(filters.rating)     : null,
        searchText: filters.searchText || '',
        area:       filters.area === 'All Areas' ? '' : (filters.area || ''),
      };

      const result = await hotelApi.liveCitySearch(payload);

      if (!result || result.priceType === 'UNAVAILABLE') {
        set({
          hotels: [],
          loading: false,
          warning: result?.warning || 'Live hotel search is currently unavailable. Please try again shortly.',
          totalHotelCount: 0,
          totalPagesFetched: 0,
          totalResultsReturned: 0,
        });
        return;
      }

      set({
        hotels: result.hotels || [],
        loading: false,
        warning: result.warning || null,
        totalHotelCount: result.totalHotelCount || 0,
        totalPagesFetched: result.totalPagesFetched || 0,
        totalResultsReturned: result.totalResultsReturned || 0,
      });
    } catch (err) {
      console.error('[HotelsStore] searchLive error:', err);
      set({
        loading: false,
        error: 'Something went wrong while fetching live hotels. Please try again.',
        hotels: [],
      });
    }
  },

  // ── DB Primary Search (No external APIs) ───────────

  fetchDbHotels: async () => {
    set({ loading: true, error: null, warning: null });
    try {
      const data = await hotelApi.getHotels();
      set({ hotels: data || [], loading: false });
    } catch (err) {
      set({ error: err?.message || 'Unable to load hotels right now.', loading: false });
    }
  },

  searchDbHotels: async (overrides = {}) => {
    const filters = { ...get().filters, ...overrides };
    set({ loading: true, error: null, warning: null, hotels: [] });
    
    try {
      const params = {};
      if (filters.city) params.city = filters.city;
      if (filters.area && filters.area !== 'All Areas') params.area = filters.area;
      if (filters.budgetMin) params.budgetMin = filters.budgetMin;
      if (filters.budgetMax) params.budgetMax = filters.budgetMax;
      if (filters.rating) params.rating = filters.rating;
      if (filters.searchText) params.name = filters.searchText;

      const data = await hotelApi.searchHotels(params);
      set({ hotels: data || [], loading: false });
    } catch (err) {
      console.error('[HotelsStore] searchDbHotels error:', err);
      set({ error: 'Unable to load hotels right now.', loading: false });
    }
  },

  // ── Single hotel detail ────────────────────────────────────────────

  fetchHotelById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await hotelApi.getHotelById(id);
      set({ selectedHotel: data, loading: false });
    } catch (err) {
      set({ error: err?.message || 'Failed to load hotel details.', loading: false });
    }
  },

  fetchLiveHotelPrice: async (hotelId, params = {}) => {
    try {
      return await hotelApi.liveHotelPrice({ hotelId, ...params });
    } catch {
      return null;
    }
  },
}));
