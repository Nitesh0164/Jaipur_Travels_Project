package com.example.jaipurtravel.service;

import com.example.jaipurtravel.dto.request.HotelCreateRequest;
import com.example.jaipurtravel.dto.request.HotelSearchLiveRequest;
import com.example.jaipurtravel.dto.request.HotelSearchRequest;
import com.example.jaipurtravel.dto.request.HotelUpdateRequest;
import com.example.jaipurtravel.dto.response.HotelResponse;
import com.example.jaipurtravel.dto.response.HotelSearchLiveResponse;

import java.util.List;

public interface HotelService {

    /** All hotels in DB (no filters) */
    List<HotelResponse> getAllHotels();

    /** Single hotel by primary key */
    HotelResponse getHotelById(Long id);

    /** Filter DB hotels by area / budget / rating / text */
    List<HotelResponse> searchHotels(HotelSearchRequest req);

    /**
     * Attempts live MakCorps pricing; falls back to DB estimated prices.
     * Never throws — always returns a valid response.
     */
    HotelSearchLiveResponse searchLiveHotels(HotelSearchLiveRequest req);

    /** Hotels near a named place (area/name text match) */
    List<HotelResponse> getHotelsNearbyPlace(String place);

    // ── Admin ────────────────────────────────────────────────────────

    HotelResponse createHotel(HotelCreateRequest req);

    HotelResponse updateHotel(Long id, HotelUpdateRequest req);

    void deleteHotel(Long id);

    /**
     * Sync hotels from MakCorps using the configured Jaipur city ID.
     * Returns a human-readable summary message.
     */
    String syncFromMakCorps();
}
