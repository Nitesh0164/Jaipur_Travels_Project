package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.request.HotelCreateRequest;
import com.example.jaipurtravel.dto.request.HotelSearchLiveRequest;
import com.example.jaipurtravel.dto.request.HotelSearchRequest;
import com.example.jaipurtravel.dto.request.HotelUpdateRequest;
import com.example.jaipurtravel.dto.response.*;
import com.example.jaipurtravel.entity.Hotel;
import com.example.jaipurtravel.entity.Hotel.PriceType;
import com.example.jaipurtravel.entity.HotelPriceCache;
import com.example.jaipurtravel.exception.ResourceNotFoundException;
import com.example.jaipurtravel.integration.MakCorpsHotelClient;
import com.example.jaipurtravel.repository.HotelPriceCacheRepository;
import com.example.jaipurtravel.repository.HotelRepository;
import com.example.jaipurtravel.service.HotelService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepo;
    private final HotelPriceCacheRepository cacheRepo;
    private final MakCorpsHotelClient makCorpsClient;
    private final com.example.jaipurtravel.integration.HotelsApiClient hotelsApiClient;
    private final ObjectMapper objectMapper;

    @Value("${app.makcorps.jaipur-city-id:}")
    private String jaipurCityId;

    @Value("${app.makcorps.cache-minutes:30}")
    private int cacheMinutes;

    // ── Public read endpoints ─────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> getAllHotels() {
        return hotelRepo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HotelResponse getHotelById(Long id) {
        Hotel h = hotelRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        return toResponse(h);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> searchHotels(HotelSearchRequest req) {
        String city = req.getCity() != null ? req.getCity() : "jaipur";
        
        return hotelRepo.search(
                        city.toLowerCase(),
                        nullIfBlank(req.getArea()),
                        req.getBudgetMin(),
                        req.getBudgetMax(),
                        req.getRating(),
                        nullIfBlank(req.getSearchText()))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private HotelResponse mapExternalToHotelResponse(Map<String, Object> data) {
        String id = ofStr(data, "id");
        String name = ofStr(data, "name");
        String city = ofStr(data, "city");
        String address = ofStr(data, "address");
        BigDecimal rating = null;
        Integer starRating = 3;
        
        if (data.get("rating") != null) {
            try {
                rating = new BigDecimal(data.get("rating").toString());
                starRating = rating.intValue();
            } catch (Exception ignored) {}
        }

        BigDecimal lat = null;
        BigDecimal lng = null;
        if (data.get("lat") != null) {
            try { lat = new BigDecimal(data.get("lat").toString()); } catch (Exception ignored) {}
        }
        if (data.get("lng") != null) {
            try { lng = new BigDecimal(data.get("lng").toString()); } catch (Exception ignored) {}
        }

        List<String> amenities = new ArrayList<>();
        if (data.get("amenities") instanceof List) {
            amenities = (List<String>) data.get("amenities");
        }

        // Estimated prices based on star rating
        BigDecimal priceMin;
        BigDecimal priceMax;
        switch (starRating) {
            case 1:
            case 2:
                priceMin = BigDecimal.valueOf(800);
                priceMax = BigDecimal.valueOf(2000);
                break;
            case 4:
                priceMin = BigDecimal.valueOf(4000);
                priceMax = BigDecimal.valueOf(8000);
                break;
            case 5:
                priceMin = BigDecimal.valueOf(8000);
                priceMax = BigDecimal.valueOf(15000);
                break;
            case 3:
            default:
                priceMin = BigDecimal.valueOf(2000);
                priceMax = BigDecimal.valueOf(4000);
                break;
        }

        return HotelResponse.builder()
                .id(id != null ? (long) id.hashCode() : 0L) // Dummy ID
                .name(name)
                .city(city)
                .address(address)
                .latitude(lat)
                .longitude(lng)
                .rating(rating)
                .starRating(starRating)
                .amenities(amenities)
                .priceMin(priceMin)
                .priceMax(priceMax)
                .currency("INR")
                .priceType(PriceType.ESTIMATED.name())
                .source("HOTELS_API")
                .build();
    }

    private boolean filterByBudgetExternal(HotelResponse h, BigDecimal min, BigDecimal max) {
        if (min == null && max == null) return true;
        if (min != null && h.getPriceMin() != null && h.getPriceMin().compareTo(min) < 0) return false;
        if (max != null && h.getPriceMax() != null && h.getPriceMax().compareTo(max) > 0) return false;
        return true;
    }

    private boolean filterByAreaExternal(HotelResponse h, String area) {
        if (area == null || area.isBlank() || "All Areas".equalsIgnoreCase(area)) return true;
        String a = area.toLowerCase();
        return h.getAddress() != null && h.getAddress().toLowerCase().contains(a);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> getHotelsNearbyPlace(String place) {
        if (place == null || place.isBlank()) return Collections.emptyList();
        return hotelRepo.findNearbyPlace("jaipur", place.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Live search ───────────────────────────────────────────────────

    /**
     * Tries:
     *  1. Valid cache hit   → return cached prices marked LIVE
     *  2. MakCorps live     → fetch, cache, return marked LIVE
     *  3. DB estimated      → fallback, return marked ESTIMATED with a warning message
     */
    @Override
    @Transactional
    public HotelSearchLiveResponse searchLiveHotels(HotelSearchLiveRequest req) {
        // Defaults
        String city      = req.getCity() != null ? req.getCity().toLowerCase() : "jaipur";
        String currency  = req.getCurrency() != null ? req.getCurrency() : "INR";
        int adults       = req.getAdults()   != null ? req.getAdults()   : 2;
        int rooms        = req.getRooms()    != null ? req.getRooms()    : 1;
        int children     = req.getChildren() != null ? req.getChildren() : 0;

        // Dates needed for live pricing
        LocalDate checkIn  = req.getCheckIn();
        LocalDate checkOut = req.getCheckOut();
        boolean hasDates   = checkIn != null && checkOut != null && checkOut.isAfter(checkIn);

        // Base DB query for the candidate hotels
        List<Hotel> candidates = hotelRepo.search(
                city,
                nullIfBlank(req.getArea()),
                req.getBudgetMin(),
                req.getBudgetMax(),
                req.getRating(),
                nullIfBlank(req.getSearchText()));

        if (!hasDates || !makCorpsClient.isConfigured() || isBlank(jaipurCityId)) {
            // Straight estimated fallback
            String msg = !hasDates
                    ? "Showing estimated prices. Provide check-in and check-out dates for live availability."
                    : "Live pricing is currently unavailable. Showing estimated prices.";
            return buildEstimatedResponse(candidates, msg);
        }

        // ── Attempt live pricing for each candidate ─────────────────
        boolean anyLive = false;
        List<HotelResponse> results = new ArrayList<>();

        for (Hotel hotel : candidates) {
            try {
                HotelResponse hotelResp = enrichWithLivePrice(hotel, currency, rooms, adults, children, checkIn, checkOut);
                results.add(hotelResp);
                if ("LIVE".equals(hotelResp.getPriceType())) anyLive = true;
            } catch (Exception e) {
                // Never propagate — just use estimated for this hotel
                log.warn("[Hotels] Live price failed for hotel {}: {}", hotel.getId(), e.getMessage());
                results.add(toResponse(hotel));
            }
        }

        String priceSource = anyLive ? "LIVE" : "ESTIMATED";
        String message     = anyLive
                ? "Showing live hotel prices for your dates."
                : "Live prices unavailable for these dates. Showing estimated prices.";

        return HotelSearchLiveResponse.builder()
                .hotels(results)
                .totalFound(results.size())
                .priceSource(priceSource)
                .message(message)
                .searchedAt(LocalDateTime.now().toString())
                .build();
    }

    // ── Admin CRUD ────────────────────────────────────────────────────

    @Override
    @Transactional
    public HotelResponse createHotel(HotelCreateRequest req) {
        Hotel h = Hotel.builder()
                .name(req.getName())
                .city(req.getCity() != null ? req.getCity().toLowerCase() : "jaipur")
                .area(req.getArea())
                .address(req.getAddress())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .rating(req.getRating())
                .starRating(req.getStarRating())
                .imageUrl(req.getImageUrl())
                .amenitiesJson(req.getAmenitiesJson())
                .priceMin(req.getPriceMin())
                .priceMax(req.getPriceMax())
                .currency(req.getCurrency() != null ? req.getCurrency() : "INR")
                .priceType(PriceType.ESTIMATED)
                .source("MANUAL")
                .build();
        return toResponse(hotelRepo.save(h));
    }

    @Override
    @Transactional
    public HotelResponse updateHotel(Long id, HotelUpdateRequest req) {
        Hotel h = hotelRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        if (req.getName()         != null) h.setName(req.getName());
        if (req.getArea()         != null) h.setArea(req.getArea());
        if (req.getAddress()      != null) h.setAddress(req.getAddress());
        if (req.getRating()       != null) h.setRating(req.getRating());
        if (req.getStarRating()   != null) h.setStarRating(req.getStarRating());
        if (req.getImageUrl()     != null) h.setImageUrl(req.getImageUrl());
        if (req.getAmenitiesJson()!= null) h.setAmenitiesJson(req.getAmenitiesJson());
        if (req.getPriceMin()     != null) h.setPriceMin(req.getPriceMin());
        if (req.getPriceMax()     != null) h.setPriceMax(req.getPriceMax());
        if (req.getCurrency()     != null) h.setCurrency(req.getCurrency());
        return toResponse(hotelRepo.save(h));
    }

    @Override
    @Transactional
    public void deleteHotel(Long id) {
        if (!hotelRepo.existsById(id)) {
            throw new ResourceNotFoundException("Hotel", "id", id);
        }
        hotelRepo.deleteById(id);
    }

    // ── MakCorps city-level sync ──────────────────────────────────────

    @Override
    @Transactional
    public String syncFromMakCorps() {
        if (!makCorpsClient.isConfigured()) {
            return "MakCorps API key is not configured. Set MAKCORPS_API_KEY environment variable.";
        }
        if (isBlank(jaipurCityId)) {
            return "Jaipur city ID is not configured. Set MAKCORPS_JAIPUR_CITY_ID environment variable " +
                    "after finding it via /api/admin/hotels/sync-makcorps/mapping-search?name=Jaipur.";
        }

        // Use tomorrow as default check-in for sync (just to get hotel list)
        LocalDate checkIn  = LocalDate.now().plusDays(1);
        LocalDate checkOut = checkIn.plusDays(1);

        int synced = 0;
        for (int page = 0; page <= 2; page++) {
            Map<String, Object> raw = makCorpsClient.searchCityHotelsPage(
                    jaipurCityId, page, "INR", 1, 2, 0, checkIn, checkOut, false);
            if (raw == null) break;

            int count = upsertHotelsFromCityResponse(raw);
            synced += count;
            if (count == 0) break; // no more pages
            log.info("[Hotels] Synced page={} hotels={}", page, count);
        }

        return synced > 0
                ? "Synced " + synced + " hotels from MakCorps."
                : "MakCorps returned no hotels. Check city ID or API quota.";
    }

    // ── Private helpers ───────────────────────────────────────────────

    /** Enrich a hotel with live price from MakCorps cache or fresh API call. */
    private HotelResponse enrichWithLivePrice(
            Hotel hotel, String currency, int rooms, int adults, int children,
            LocalDate checkIn, LocalDate checkOut) {

        if (hotel.getSourceHotelId() == null || hotel.getSourceHotelId().isBlank()) {
            return toResponse(hotel); // no provider ID — fall back to estimated
        }

        // Check cache first
        Optional<HotelPriceCache> cached = cacheRepo.findValidCache(
                hotel, checkIn, checkOut, adults, rooms, LocalDateTime.now());

        if (cached.isPresent()) {
            return toResponseWithCache(hotel, cached.get(), "LIVE");
        }

        // Live call
        Map<String, Object> raw = makCorpsClient.searchHotelPrices(
                hotel.getSourceHotelId(), currency, rooms, adults, checkIn, checkOut);

        if (raw == null) return toResponse(hotel);

        // Parse and cache
        HotelPriceCache entry = parsePriceCache(hotel, raw, checkIn, checkOut, adults, rooms, children, currency);
        if (entry != null) {
            cacheRepo.save(entry);
            // Update hotel's own price fields for future estimated fallback
            hotel.setPriceMin(entry.getMinPrice());
            hotel.setPriceMax(entry.getMaxPrice());
            hotel.setCheapestVendor(entry.getCheapestVendor());
            hotel.setPriceType(PriceType.LIVE);
            hotel.setLastPriceFetchedAt(LocalDateTime.now());
            hotelRepo.save(hotel);
            return toResponseWithCache(hotel, entry, "LIVE");
        }
        return toResponse(hotel);
    }

    @SuppressWarnings("unchecked")
    private HotelPriceCache parsePriceCache(
            Hotel hotel, Map<String, Object> raw,
            LocalDate checkIn, LocalDate checkOut,
            int adults, int rooms, int children, String currency) {
        try {
            // MakCorps /hotel response: { "0": { "price": "1234", "vendor": "booking" }, "1": {...}, ... }
            BigDecimal minPrice = null;
            String cheapestVendor = null;
            BigDecimal maxPrice = null;

            for (Map.Entry<String, Object> entry : raw.entrySet()) {
                if (!(entry.getValue() instanceof Map)) continue;
                Map<String, Object> offer = (Map<String, Object>) entry.getValue();
                String priceStr = ofStr(offer, "price");
                String vendor   = ofStr(offer, "vendor");
                if (priceStr == null) continue;
                try {
                    BigDecimal price = new BigDecimal(priceStr.replaceAll("[^\\d.]", ""));
                    if (minPrice == null || price.compareTo(minPrice) < 0) {
                        minPrice = price;
                        cheapestVendor = vendor;
                    }
                    if (maxPrice == null || price.compareTo(maxPrice) > 0) {
                        maxPrice = price;
                    }
                } catch (NumberFormatException ignored) {}
            }

            if (minPrice == null) return null;

            String payload = objectMapper.writeValueAsString(raw);
            return HotelPriceCache.builder()
                    .hotel(hotel)
                    .checkIn(checkIn)
                    .checkOut(checkOut)
                    .adults(adults)
                    .rooms(rooms)
                    .children(children)
                    .currency(currency)
                    .payloadJson(payload)
                    .minPrice(minPrice)
                    .maxPrice(maxPrice != null ? maxPrice : minPrice)
                    .cheapestVendor(cheapestVendor)
                    .expiresAt(LocalDateTime.now().plusMinutes(cacheMinutes))
                    .build();
        } catch (Exception e) {
            log.warn("[Hotels] parsePriceCache error for hotel {}: {}", hotel.getId(), e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private int upsertHotelsFromCityResponse(Map<String, Object> raw) {
        int count = 0;
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            if (!(entry.getValue() instanceof Map)) continue;
            Map<String, Object> h = (Map<String, Object>) entry.getValue();
            String hotelId   = ofStr(h, "hotelid");
            String hotelName = ofStr(h, "name");
            if (hotelId == null || hotelName == null) continue;

            try {
                Optional<Hotel> existing = hotelRepo.findBySourceAndSourceHotelId("MAKCORPS", hotelId);
                Hotel hotel = existing.orElseGet(Hotel::new);
                hotel.setSource("MAKCORPS");
                hotel.setSourceHotelId(hotelId);
                hotel.setName(hotelName);
                hotel.setCity("jaipur");
                if (ofStr(h, "address") != null) hotel.setAddress(ofStr(h, "address"));
                String ratingStr = ofStr(h, "rating");
                if (ratingStr != null) {
                    try { hotel.setRating(new BigDecimal(ratingStr)); } catch (Exception ignored) {}
                }
                String priceStr = ofStr(h, "minprice");
                if (priceStr != null) {
                    try {
                        hotel.setPriceMin(new BigDecimal(priceStr.replaceAll("[^\\d.]", "")));
                    } catch (Exception ignored) {}
                }
                hotel.setPriceType(PriceType.ESTIMATED);
                hotelRepo.save(hotel);
                count++;
            } catch (Exception e) {
                log.warn("[Hotels] upsert failed for '{}': {}", hotelName, e.getMessage());
            }
        }
        return count;
    }

    // ── Response builders ─────────────────────────────────────────────

    private HotelResponse toResponse(Hotel h) {
        return HotelResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .city(h.getCity())
                .area(h.getArea())
                .address(h.getAddress())
                .latitude(h.getLatitude())
                .longitude(h.getLongitude())
                .rating(h.getRating())
                .starRating(h.getStarRating())
                .imageUrl(h.getImageUrl())
                .amenities(parseAmenities(h.getAmenitiesJson()))
                .priceMin(effectivePriceMin(h))
                .priceMax(effectivePriceMax(h))
                .currency(h.getCurrency() != null ? h.getCurrency() : "INR")
                .priceType(h.getPriceType() != null ? h.getPriceType().name() : PriceType.ESTIMATED.name())
                .cheapestVendor(h.getCheapestVendor())
                .lastPriceFetchedAt(h.getLastPriceFetchedAt() != null ? h.getLastPriceFetchedAt().toString() : null)
                .source(h.getSource())
                .createdAt(h.getCreatedAt() != null ? h.getCreatedAt().toString() : null)
                .build();
    }

    private HotelResponse toResponseWithCache(Hotel h, HotelPriceCache cache, String priceTypeLabel) {
        HotelResponse base = toResponse(h);
        base.setPriceType(priceTypeLabel);
        base.setPriceMin(cache.getMinPrice() != null ? cache.getMinPrice() : effectivePriceMin(h));
        base.setPriceMax(cache.getMaxPrice() != null ? cache.getMaxPrice() : effectivePriceMax(h));
        base.setCheapestVendor(cache.getCheapestVendor());
        base.setLivePrice(HotelPriceResponse.builder()
                .minPrice(cache.getMinPrice())
                .maxPrice(cache.getMaxPrice())
                .currency(cache.getCurrency())
                .cheapestVendor(cache.getCheapestVendor())
                .priceType(priceTypeLabel)
                .fetchedAt(cache.getCreatedAt() != null ? cache.getCreatedAt().toString() : null)
                .expiresAt(cache.getExpiresAt() != null ? cache.getExpiresAt().toString() : null)
                .build());
        return base;
    }

    private HotelSearchLiveResponse buildEstimatedResponse(List<Hotel> hotels, String message) {
        List<HotelResponse> responses = hotels.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return HotelSearchLiveResponse.builder()
                .hotels(responses)
                .totalFound(responses.size())
                .priceSource("ESTIMATED")
                .message(message)
                .searchedAt(LocalDateTime.now().toString())
                .build();
    }

    // ── Estimated price calculation ───────────────────────────────────

    /**
     * Derive a sensible minimum price if the hotel has no stored price.
     * Uses area and starRating as heuristics:
     *   1★ / hostel  → ₹500–₹1500 (budget)
     *   2–3★         → ₹1500–₹5000 (mid)
     *   4★           → ₹4000–₹10000
     *   5★ / premium → ₹8000–₹25000
     */
    private BigDecimal effectivePriceMin(Hotel h) {
        if (h.getPriceMin() != null) return h.getPriceMin();
        return estimateMin(h);
    }

    private BigDecimal effectivePriceMax(Hotel h) {
        if (h.getPriceMax() != null) return h.getPriceMax();
        return estimateMax(h);
    }

    private BigDecimal estimateMin(Hotel h) {
        int stars = h.getStarRating() != null ? h.getStarRating() : 3;
        return switch (stars) {
            case 1  -> BigDecimal.valueOf(500);
            case 2  -> BigDecimal.valueOf(1500);
            case 4  -> BigDecimal.valueOf(4500);
            case 5  -> BigDecimal.valueOf(9000);
            default -> BigDecimal.valueOf(2000); // 3-star default
        };
    }

    private BigDecimal estimateMax(Hotel h) {
        int stars = h.getStarRating() != null ? h.getStarRating() : 3;
        return switch (stars) {
            case 1  -> BigDecimal.valueOf(1500);
            case 2  -> BigDecimal.valueOf(3500);
            case 4  -> BigDecimal.valueOf(10000);
            case 5  -> BigDecimal.valueOf(25000);
            default -> BigDecimal.valueOf(6000);
        };
    }

    // ── Utility ───────────────────────────────────────────────────────

    private List<String> parseAmenities(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private String ofStr(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : null;
    }
}
