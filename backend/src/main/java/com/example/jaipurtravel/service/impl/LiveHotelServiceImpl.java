package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.request.LiveCitySearchRequest;
import com.example.jaipurtravel.dto.response.LiveCitySearchResponse;
import com.example.jaipurtravel.dto.response.LiveHotelResult;
import com.example.jaipurtravel.integration.MakCorpsHotelClient;
import com.example.jaipurtravel.integration.MakCorpsHotelClient.MultiPageResult;
import com.example.jaipurtravel.service.LiveHotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiveHotelServiceImpl implements LiveHotelService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final MakCorpsHotelClient makCorpsClient;

    @Value("${app.makcorps.jaipur-city-id:}")
    private String jaipurCityId;

    // ── Mapping ───────────────────────────────────────────────────────

    @Override
    public List<Map<String, Object>> mappingSearch(String name) {
        if (!makCorpsClient.isConfigured()) {
            log.warn("[LiveHotel] MakCorps not configured — mapping search skipped");
            return Collections.emptyList();
        }
        return makCorpsClient.mappingSearch(name != null ? name : "Jaipur");
    }

    // ── Live city search ──────────────────────────────────────────────

    @Override
    public LiveCitySearchResponse liveCitySearch(LiveCitySearchRequest req) {
        // Guard: API key
        if (!makCorpsClient.isConfigured()) {
            return degraded("MakCorps API key is not configured. " +
                    "Set MAKCORPS_API_KEY environment variable.");
        }

        // Resolve city ID: request body → YAML config → error
        String cityId = resolveNonBlank(
                req.getCityId() != null ? req.getCityId().trim() : null,
                jaipurCityId);

        if (cityId == null) {
            return degraded("Jaipur city ID is not set. " +
                    "Either pass 'cityId' in the request body or set MAKCORPS_JAIPUR_CITY_ID " +
                    "in application config. " +
                    "Hint: call GET /api/hotels/mapping?name=Jaipur to find the city ID.");
        }

        // Validate dates
        String checkIn  = req.getCheckIn();
        String checkOut = req.getCheckOut();
        if (!hasValidDates(checkIn, checkOut)) {
            // Use tomorrow / day-after defaults so API can still be called
            checkIn  = LocalDate.now().plusDays(1).format(DATE_FMT);
            checkOut = LocalDate.now().plusDays(2).format(DATE_FMT);
            req.setCheckIn(checkIn);
            req.setCheckOut(checkOut);
            log.info("[LiveHotel] Dates not provided — defaulting checkIn={} checkOut={}", checkIn, checkOut);
        }

        // Call MakCorps with pagination
        MultiPageResult result;
        try {
            result = makCorpsClient.searchCityHotelsAllPages(req, cityId);
        } catch (Exception e) {
            log.error("[LiveHotel] Unexpected error from MakCorps: {}", e.getMessage(), e);
            return degraded("Unable to fetch live hotel data right now. Please try again later.");
        }

        // Apply optional post-fetch filters
        List<LiveHotelResult> filtered = applyFilters(result.hotels(), req);

        return LiveCitySearchResponse.builder()
                .city(req.getCity() != null ? req.getCity() : "Jaipur")
                .cityId(cityId)
                .source("MAKCORPS")
                .priceType("LIVE")
                .totalHotelCount(result.totalHotelCount())
                .totalMakCorpsPages(result.totalMakCorpsPages())
                .totalPagesFetched(result.pagesFetched())
                .totalResultsReturned(filtered.size())
                .hotels(filtered)
                .warning(result.warning())
                .searchedAt(LocalDateTime.now().toString())
                .build();
    }

    // ── Single hotel prices ───────────────────────────────────────────

    @Override
    public Map<String, Object> liveHotelPrice(
            String hotelId, String currency, int rooms, int adults,
            String checkInStr, String checkOutStr) {

        if (!makCorpsClient.isConfigured()) {
            return Map.of("error", "MakCorps API key not configured.");
        }
        try {
            LocalDate checkIn  = parseDateOrDefault(checkInStr,  LocalDate.now().plusDays(1));
            LocalDate checkOut = parseDateOrDefault(checkOutStr, checkIn.plusDays(1));
            Map<String, Object> raw = makCorpsClient.searchHotelPrices(
                    hotelId,
                    currency != null ? currency : "INR",
                    Math.max(rooms, 1),
                    Math.max(adults, 1),
                    checkIn,
                    checkOut);
            return raw != null ? raw : Map.of("error", "No price data returned from MakCorps.");
        } catch (Exception e) {
            log.warn("[LiveHotel] liveHotelPrice failed for {}: {}", hotelId, e.getMessage());
            return Map.of("error", "Unable to fetch hotel price right now.");
        }
    }

    // ── Filtering ─────────────────────────────────────────────────────

    private List<LiveHotelResult> applyFilters(List<LiveHotelResult> hotels, LiveCitySearchRequest req) {
        if (hotels == null || hotels.isEmpty()) return Collections.emptyList();

        return hotels.stream()
                .filter(h -> filterByBudget(h, req.getBudgetMin(), req.getBudgetMax()))
                .filter(h -> filterByRating(h, req.getRating()))
                .filter(h -> filterByText(h, req.getSearchText()))
                .filter(h -> filterByArea(h, req.getArea()))
                .collect(Collectors.toList());
    }

    private boolean filterByBudget(LiveHotelResult h, BigDecimal min, BigDecimal max) {
        if (min == null && max == null) return true;
        if (h.getPrice() == null) return true; // include if price unknown
        if (min != null && h.getPrice().compareTo(min) < 0) return false;
        if (max != null && h.getPrice().compareTo(max) > 0) return false;
        return true;
    }

    private boolean filterByRating(LiveHotelResult h, BigDecimal minRating) {
        if (minRating == null || h.getRating() == null) return true;
        return h.getRating().compareTo(minRating) >= 0;
    }

    private boolean filterByText(LiveHotelResult h, String text) {
        if (text == null || text.isBlank()) return true;
        String q = text.toLowerCase();
        return (h.getName() != null    && h.getName().toLowerCase().contains(q))
            || (h.getAddress() != null && h.getAddress().toLowerCase().contains(q));
    }

    private boolean filterByArea(LiveHotelResult h, String area) {
        if (area == null || area.isBlank() || "All Areas".equalsIgnoreCase(area)) return true;
        String a = area.toLowerCase();
        return h.getAddress() != null && h.getAddress().toLowerCase().contains(a);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private LiveCitySearchResponse degraded(String warning) {
        return LiveCitySearchResponse.builder()
                .city("Jaipur")
                .source("MAKCORPS")
                .priceType("UNAVAILABLE")
                .totalHotelCount(0)
                .totalMakCorpsPages(0)
                .totalPagesFetched(0)
                .totalResultsReturned(0)
                .hotels(Collections.emptyList())
                .warning(warning)
                .searchedAt(LocalDateTime.now().toString())
                .build();
    }

    private static String resolveNonBlank(String... candidates) {
        for (String c : candidates) {
            if (c != null && !c.isBlank()) return c;
        }
        return null;
    }

    private static boolean hasValidDates(String checkIn, String checkOut) {
        if (checkIn == null || checkOut == null || checkIn.isBlank() || checkOut.isBlank()) return false;
        try {
            LocalDate in  = LocalDate.parse(checkIn,  DATE_FMT);
            LocalDate out = LocalDate.parse(checkOut, DATE_FMT);
            return out.isAfter(in);
        } catch (Exception e) { return false; }
    }

    private static LocalDate parseDateOrDefault(String s, LocalDate def) {
        if (s == null || s.isBlank()) return def;
        try { return LocalDate.parse(s, DATE_FMT); }
        catch (Exception e) { return def; }
    }
}
