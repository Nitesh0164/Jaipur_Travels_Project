package com.example.jaipurtravel.integration;

import com.example.jaipurtravel.dto.request.LiveCitySearchRequest;
import com.example.jaipurtravel.dto.response.LiveHotelResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Secure proxy to MakCorps Hotel Pricing API.
 * ─────────────────────────────────────────────
 * • API key lives ONLY here — never exposed to the frontend.
 * • All methods return empty/null on any failure so callers
 *   can safely return a degraded response rather than a 500.
 */
@Slf4j
@Component
public class MakCorpsHotelClient {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int ABSOLUTE_MAX_PAGES = 10; // hard safety cap

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;
    private final int configuredMaxPages;

    public MakCorpsHotelClient(
            RestTemplate restTemplate,
            @Value("${app.makcorps.api-key:}") String apiKey,
            @Value("${app.makcorps.base-url:https://api.makcorps.com}") String baseUrl,
            @Value("${app.makcorps.max-pages:5}") int configuredMaxPages) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.configuredMaxPages = configuredMaxPages;
    }

    /** True only when a non-blank API key has been configured. */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    // ── /mapping ──────────────────────────────────────────────────────

    /**
     * GET /mapping?name={name}&api_key={key}
     * Returns raw mapping results, or empty list on failure.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> mappingSearch(String name) {
        if (!isConfigured()) return Collections.emptyList();
        try {
            String url = UriComponentsBuilder.fromUriString(baseUrl + "/mapping")
                    .queryParam("name", name)
                    .queryParam("api_key", apiKey)
                    .toUriString();
            ResponseEntity<List> resp = restTemplate.getForEntity(url, List.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return (List<Map<String, Object>>) resp.getBody();
            }
        } catch (Exception e) {
            log.warn("[MakCorps] mappingSearch failed for '{}': {}", name, e.getMessage());
        }
        return Collections.emptyList();
    }

    // ── /city — single page ───────────────────────────────────────────

    /**
     * GET /city (single page).
     * Returns raw MakCorps response map, or null on any failure.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> searchCityHotelsPage(
            String cityId, int pagination, String currency,
            int rooms, int adults, int children,
            LocalDate checkIn, LocalDate checkOut, boolean tax) {

        if (!isConfigured() || isBlank(cityId)) {
            log.debug("[MakCorps] searchCityHotelsPage skipped — not configured or missing city ID");
            return null;
        }
        try {
            String url = UriComponentsBuilder.fromUriString(baseUrl + "/city")
                    .queryParam("cityid",     cityId)
                    .queryParam("pagination", pagination)
                    .queryParam("cur",        currency)
                    .queryParam("rooms",      rooms)
                    .queryParam("adults",     adults)
                    .queryParam("children",   children)
                    .queryParam("checkin",    checkIn.format(DATE_FMT))
                    .queryParam("checkout",   checkOut.format(DATE_FMT))
                    .queryParam("tax",        tax)
                    .queryParam("api_key",    apiKey)
                    .toUriString();

            log.debug("[MakCorps] /city page={} → {}", pagination, url.replaceAll("api_key=[^&]+", "api_key=***"));
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (resp.getStatusCode().is2xxSuccessful()) {
                return resp.getBody();
            }
            log.warn("[MakCorps] /city returned HTTP {} on page {}", resp.getStatusCode(), pagination);
        } catch (Exception e) {
            log.warn("[MakCorps] /city page={} failed: {}", pagination, e.getMessage());
        }
        return null;
    }

    // ── /city — multi-page ────────────────────────────────────────────

    /**
     * Fetches multiple pages from MakCorps /city and accumulates
     * parsed {@link LiveHotelResult} objects.
     *
     * @return a result holder with the list of hotels and metadata
     */
    public MultiPageResult searchCityHotelsAllPages(LiveCitySearchRequest req, String resolvedCityId) {
        String currency = def(req.getCurrency(), "INR");
        int adults      = def(req.getAdults(),   2);
        int rooms       = def(req.getRooms(),    1);
        int children    = def(req.getChildren(), 0);
        boolean tax     = req.getTax() != null && req.getTax();

        // Parse dates — use tomorrow/day-after if missing
        LocalDate checkIn  = parseDateOrDefault(req.getCheckIn(),  LocalDate.now().plusDays(1));
        LocalDate checkOut = parseDateOrDefault(req.getCheckOut(), checkIn.plusDays(1));

        // Honour request maxPages but cap it hard
        int requestedMax  = req.getMaxPages() != null ? req.getMaxPages() : configuredMaxPages;
        int effectiveMax  = Math.min(requestedMax, ABSOLUTE_MAX_PAGES);

        List<LiveHotelResult> accumulated = new ArrayList<>();
        int pagesFetched   = 0;
        int totalHotels    = 0;
        int totalMakPages  = 0;
        String warning     = null;

        for (int page = 0; page < effectiveMax; page++) {
            Map<String, Object> raw = searchCityHotelsPage(
                    resolvedCityId, page, currency, rooms, adults, children, checkIn, checkOut, tax);

            if (raw == null) {
                warning = "Live hotel data may be incomplete; one or more pages could not be fetched.";
                log.warn("[MakCorps] page {} returned null — stopping pagination", page);
                break;
            }

            // Extract metadata from first page
            if (page == 0) {
                totalHotels   = intVal(raw, "totalHotelCount", intVal(raw, "total", 0));
                totalMakPages = intVal(raw, "totalpageCount",  intVal(raw, "totalPages", 1));
            }

            List<LiveHotelResult> pageHotels = parseHotelsFromPage(raw, currency);
            int pageCount = intVal(raw, "currentPageHotelsCount", pageHotels.size());

            accumulated.addAll(pageHotels);
            pagesFetched++;

            log.info("[MakCorps] page={} hotels={} cumulative={}", page, pageCount, accumulated.size());

            // Stop conditions
            boolean lastPage = (page >= totalMakPages - 1) || pageHotels.isEmpty() || pageCount == 0;
            if (lastPage) break;
        }

        return new MultiPageResult(accumulated, pagesFetched, totalHotels, totalMakPages, warning);
    }

    // ── /hotel — single hotel prices ─────────────────────────────────

    /**
     * GET /hotel — vendor prices for a single hotel ID.
     * Returns null on any failure.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> searchHotelPrices(
            String hotelId, String currency, int rooms, int adults,
            LocalDate checkIn, LocalDate checkOut) {

        if (!isConfigured() || isBlank(hotelId)) return null;
        try {
            String url = UriComponentsBuilder.fromUriString(baseUrl + "/hotel")
                    .queryParam("id",       hotelId)
                    .queryParam("currency", currency)
                    .queryParam("rooms",    rooms)
                    .queryParam("adults",   adults)
                    .queryParam("checkin",  checkIn.format(DATE_FMT))
                    .queryParam("checkout", checkOut.format(DATE_FMT))
                    .queryParam("api_key",  apiKey)
                    .toUriString();

            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (resp.getStatusCode().is2xxSuccessful()) {
                return resp.getBody();
            }
            log.warn("[MakCorps] /hotel returned HTTP {} for {}", resp.getStatusCode(), hotelId);
        } catch (Exception e) {
            log.warn("[MakCorps] /hotel failed for {}: {}", hotelId, e.getMessage());
        }
        return null;
    }

    // ── Parsing helpers ───────────────────────────────────────────────

    /**
     * Parse the MakCorps /city page response into a list of {@link LiveHotelResult}.
     *
     * MakCorps response structure (numeric keys 0..N):
     * {
     *   "0": { "hotelid": "...", "name": "...", "price1": "...", "vendor1": "...", ... },
     *   "1": { ... },
     *   "totalHotelCount": 910,
     *   ...
     * }
     */
    @SuppressWarnings("unchecked")
    private List<LiveHotelResult> parseHotelsFromPage(Map<String, Object> raw, String currency) {
        List<LiveHotelResult> results = new ArrayList<>();
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            // Skip metadata keys (non-numeric)
            if (!isNumericKey(entry.getKey())) continue;
            if (!(entry.getValue() instanceof Map)) continue;

            Map<String, Object> h = (Map<String, Object>) entry.getValue();
            String hotelId = str(h, "hotelid");
            String name    = str(h, "name");
            if (hotelId == null || name == null) continue;

            try {
                results.add(LiveHotelResult.builder()
                        .sourceHotelId(hotelId)
                        .name(name)
                        .address(str(h, "address"))
                        .rating(decimal(h, "rating"))
                        .reviewCount(intObjVal(h, "reviewcount"))
                        .latitude(decimal(h, "latitude"))
                        .longitude(decimal(h, "longitude"))
                        .price(decimal(h, "price1"))
                        .currency(str(h, "cur") != null ? str(h, "cur") : currency)
                        .vendor(str(h, "vendor1"))
                        .price2(decimal(h, "price2"))
                        .vendor2(str(h, "vendor2"))
                        .imageUrl(null)   // /city response doesn't include images
                        .priceType("LIVE")
                        .build());
            } catch (Exception e) {
                log.debug("[MakCorps] skip hotel '{}': {}", name, e.getMessage());
            }
        }
        return results;
    }

    // ── Utility ───────────────────────────────────────────────────────

    private static boolean isNumericKey(String key) {
        if (key == null || key.isBlank()) return false;
        for (char c : key.toCharArray()) { if (!Character.isDigit(c)) return false; }
        return true;
    }

    private static String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString().trim() : null;
    }

    private static BigDecimal decimal(Map<String, Object> m, String key) {
        String s = str(m, key);
        if (s == null || s.isBlank() || s.equalsIgnoreCase("null")) return null;
        try { return new BigDecimal(s.replaceAll("[^\\d.]", "")); }
        catch (Exception e) { return null; }
    }

    private static int intVal(Map<String, Object> m, String key, int fallback) {
        Object v = m.get(key);
        if (v == null) return fallback;
        try { return Integer.parseInt(v.toString()); }
        catch (Exception e) { return fallback; }
    }

    private static Integer intObjVal(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v == null) return null;
        try { return Integer.parseInt(v.toString()); }
        catch (Exception e) { return null; }
    }

    private static String def(String s, String d)   { return (s != null && !s.isBlank()) ? s : d; }
    private static int    def(Integer i, int d)      { return i != null ? i : d; }
    private static boolean isBlank(String s)         { return s == null || s.isBlank(); }

    private static LocalDate parseDateOrDefault(String s, LocalDate def) {
        if (s == null || s.isBlank()) return def;
        try { return LocalDate.parse(s, DATE_FMT); }
        catch (Exception e) { return def; }
    }

    // ── Inner result holder ───────────────────────────────────────────

    public record MultiPageResult(
            List<LiveHotelResult> hotels,
            int pagesFetched,
            int totalHotelCount,
            int totalMakCorpsPages,
            String warning) {}
}
