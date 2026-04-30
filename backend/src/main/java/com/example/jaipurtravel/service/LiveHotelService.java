package com.example.jaipurtravel.service;

import com.example.jaipurtravel.dto.request.LiveCitySearchRequest;
import com.example.jaipurtravel.dto.response.LiveCitySearchResponse;

import java.util.List;
import java.util.Map;

/**
 * Live MakCorps hotel search service — no DB dependency for user-facing results.
 */
public interface LiveHotelService {

    /**
     * Calls MakCorps /mapping endpoint.
     * Returns raw mapping results so admin/user can find a city/hotel ID.
     */
    List<Map<String, Object>> mappingSearch(String name);

    /**
     * Calls MakCorps /city across multiple pages, applies optional filters,
     * and returns a normalised {@link LiveCitySearchResponse}.
     * Never throws — returns a degraded response with a warning on failure.
     */
    LiveCitySearchResponse liveCitySearch(LiveCitySearchRequest req);

    /**
     * Calls MakCorps /hotel for a single hotel ID.
     * Returns null-safe raw vendor prices for the hotel detail view.
     */
    Map<String, Object> liveHotelPrice(String hotelId, String currency, int rooms, int adults,
                                       String checkIn, String checkOut);
}
