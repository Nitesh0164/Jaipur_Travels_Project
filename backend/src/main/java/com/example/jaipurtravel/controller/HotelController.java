package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.request.HotelSearchLiveRequest;
import com.example.jaipurtravel.dto.request.HotelSearchRequest;
import com.example.jaipurtravel.dto.request.LiveCitySearchRequest;
import com.example.jaipurtravel.dto.response.HotelResponse;
import com.example.jaipurtravel.dto.response.HotelSearchLiveResponse;
import com.example.jaipurtravel.dto.response.LiveCitySearchResponse;
import com.example.jaipurtravel.service.HotelService;
import com.example.jaipurtravel.service.LiveHotelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotels", description = "Jaipur hotel search — live MakCorps API + DB fallback")
public class HotelController {

    private final HotelService hotelService;
    private final LiveHotelService liveHotelService;

    // ── DB-backed / seeded endpoints (fallback / admin tooling) ──────

    @GetMapping
    @Operation(summary = "[Fallback] List seeded/DB hotels — use /live-city-search for live results")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Hotels fetched", hotelService.getAllHotels()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get seeded hotel by DB ID")
    public ResponseEntity<ApiResponse<HotelResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Hotel fetched", hotelService.getHotelById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "[Fallback] Search DB hotels by area, budget, rating, text")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> search(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) BigDecimal budgetMin,
            @RequestParam(required = false) BigDecimal budgetMax,
            @RequestParam(required = false) BigDecimal rating) {

        HotelSearchRequest req = new HotelSearchRequest();
        req.setArea(area);
        req.setSearchText(q);
        req.setBudgetMin(budgetMin);
        req.setBudgetMax(budgetMax);
        req.setRating(rating);

        return ResponseEntity.ok(ApiResponse.ok("Search results", hotelService.searchHotels(req)));
    }

    @PostMapping("/search-live")
    @Operation(summary = "[Legacy] Live hotel price search (MakCorps → cache → estimated fallback)")
    public ResponseEntity<ApiResponse<HotelSearchLiveResponse>> searchLive(
            @RequestBody HotelSearchLiveRequest req) {
        HotelSearchLiveResponse result = hotelService.searchLiveHotels(req);
        return ResponseEntity.ok(ApiResponse.ok(result.getMessage(), result));
    }

    @GetMapping("/nearby-place")
    @Operation(summary = "[Fallback] Find DB hotels near a named place or area")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> nearbyPlace(
            @RequestParam String place) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Hotels near " + place, hotelService.getHotelsNearbyPlace(place)));
    }

    // ── External API (Hotels-API.com) ─────────────────────────────────

    @GetMapping("/external/search")
    @Operation(summary = "Search external hotels (Hotels-API.com) with estimated pricing",
               description = "Fetches hotels from external API. Does not provide live prices, only generated estimates based on star ratings.")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> searchExternal(
            @RequestParam(defaultValue = "Jaipur") String city,
            @RequestParam(defaultValue = "India") String country,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(defaultValue = "50") Integer limit,
            @RequestParam(defaultValue = "1") Integer page) {

        HotelSearchRequest req = new HotelSearchRequest();
        req.setCity(city);
        req.setSearchText(name);
        if (minRating != null) {
            req.setRating(BigDecimal.valueOf(minRating));
        }

        // searchHotels() in HotelService is now updated to fetch from HotelsApiClient first
        return ResponseEntity.ok(ApiResponse.ok("External search results", hotelService.searchHotels(req)));
    }

    // ── Live MakCorps endpoints (primary user-facing) ─────────────────

    @GetMapping("/mapping")
    @Operation(summary = "Search MakCorps /mapping to find city or hotel IDs",
               description = "Use this to discover the Jaipur city ID (set MAKCORPS_JAIPUR_CITY_ID). " +
                             "Results are raw MakCorps mapping data.")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> mapping(
            @Parameter(description = "Name to search, e.g. 'Jaipur'")
            @RequestParam(defaultValue = "Jaipur") String name) {
        List<Map<String, Object>> results = liveHotelService.mappingSearch(name);
        return ResponseEntity.ok(ApiResponse.ok(
                "Mapping results for '" + name + "' (" + results.size() + " found)", results));
    }

    @PostMapping("/live-city-search")
    @Operation(summary = "Fetch live Jaipur hotels from MakCorps with pagination and optional filters",
               description = "Calls MakCorps /city across multiple pages. " +
                             "Applies optional budgetMin/Max, rating, searchText, area filters after fetching. " +
                             "Never returns 500 — returns a degraded response with 'warning' on failure.")
    public ResponseEntity<ApiResponse<LiveCitySearchResponse>> liveCitySearch(
            @RequestBody LiveCitySearchRequest req) {
        LiveCitySearchResponse result = liveHotelService.liveCitySearch(req);
        String msg = result.getWarning() != null
                ? result.getWarning()
                : "Live hotel search: " + result.getTotalResultsReturned() + " hotels returned";
        return ResponseEntity.ok(ApiResponse.ok(msg, result));
    }

    @GetMapping("/live-hotel-price")
    @Operation(summary = "Fetch vendor prices for a single MakCorps hotel ID",
               description = "Calls MakCorps /hotel endpoint. Returns raw vendor price map.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> liveHotelPrice(
            @RequestParam String hotelId,
            @RequestParam(defaultValue = "INR") String currency,
            @RequestParam(defaultValue = "1")   int rooms,
            @RequestParam(defaultValue = "2")   int adults,
            @RequestParam(required = false)     String checkIn,
            @RequestParam(required = false)     String checkOut) {

        Map<String, Object> result = liveHotelService.liveHotelPrice(
                hotelId, currency, rooms, adults, checkIn, checkOut);
        return ResponseEntity.ok(ApiResponse.ok("Hotel prices fetched", result));
    }
}
