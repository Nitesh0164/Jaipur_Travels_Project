import { get, post } from '../lib/api';

export const hotelApi = {
  // ── Live MakCorps endpoints (primary) ──────────────────────────────

  /**
   * POST /api/hotels/live-city-search
   * Returns live hotel results from MakCorps with pagination.
   */
  liveCitySearch: (payload) => post('/api/hotels/live-city-search', payload),

  /**
   * GET /api/hotels/mapping?name=Jaipur
   * Discover MakCorps city/hotel IDs.
   */
  mappingSearch: (name = 'Jaipur') => get(`/api/hotels/mapping?name=${encodeURIComponent(name)}`),

  /**
   * GET /api/hotels/live-hotel-price?hotelId=...
   * Vendor price breakdown for a single hotel.
   */
  liveHotelPrice: (params) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') qs.append(k, v);
    });
    return get(`/api/hotels/live-hotel-price?${qs.toString()}`);
  },

  // ── DB / seeded fallback endpoints ─────────────────────────────────

  /** GET /api/hotels — seeded DB hotels (fallback) */
  getHotels: () => get('/api/hotels'),

  /** GET /api/hotels/search — DB filter search (fallback) */
  searchHotels: (params) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') qs.append(k, v);
    });
    return get(`/api/hotels/search?${qs.toString()}`);
  },

  /** GET /api/hotels/:id */
  getHotelById: (id) => get(`/api/hotels/${id}`),

  /** GET /api/hotels/nearby-place?place= */
  getHotelsNearbyPlace: (place) =>
    get(`/api/hotels/nearby-place?place=${encodeURIComponent(place)}`),
};

export default hotelApi;
