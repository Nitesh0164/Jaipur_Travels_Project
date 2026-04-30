package com.example.jaipurtravel.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Client for Hotels-API.com
 * Used as the primary source for hotel data (info, location, amenities, etc.)
 */
@Slf4j
@Component
public class HotelsApiClient {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;
    private final String defaultCity;
    private final String defaultCountry;
    private final long cacheMinutes;

    // Simple in-memory cache structure: Key -> {timestamp, data}
    private final Map<String, CacheEntry> cache = new java.util.concurrent.ConcurrentHashMap<>();

    private static class CacheEntry {
        long expiryTime;
        Map<String, Object> data;
        CacheEntry(long expiryTime, Map<String, Object> data) {
            this.expiryTime = expiryTime;
            this.data = data;
        }
    }

    public HotelsApiClient(
            RestTemplate restTemplate,
            @Value("${app.hotelsapi.api-key:}") String apiKey,
            @Value("${app.hotelsapi.base-url:https://api.hotels-api.com/v1}") String baseUrl,
            @Value("${app.hotelsapi.default-city:Jaipur}") String defaultCity,
            @Value("${app.hotelsapi.default-country:India}") String defaultCountry,
            @Value("${app.hotelsapi.cache-minutes:60}") long cacheMinutes) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.defaultCity = defaultCity;
        this.defaultCountry = defaultCountry;
        this.cacheMinutes = cacheMinutes;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Internal helper to make the API call.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> executeSearch(String city, String country, String name, Integer minRating, Integer limit, Integer page) {
        if (!isConfigured()) return null;

        String cacheKey = String.format("%s_%s_%s_%s_%s_%s", city, country, name, minRating, limit, page);
        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && cached.expiryTime > System.currentTimeMillis()) {
            return cached.data;
        }

        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl + "/hotels/search")
                    .queryParam("city", city)
                    .queryParam("country", country);

            if (name != null && !name.isBlank()) builder.queryParam("name", name);
            if (minRating != null) builder.queryParam("min_rating", minRating);
            if (limit != null) builder.queryParam("limit", limit);
            if (page != null) builder.queryParam("page", page);

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-API-KEY", apiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    builder.toUriString(), HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Boolean success = (Boolean) body.get("success");
                if (Boolean.TRUE.equals(success)) {
                    cache.put(cacheKey, new CacheEntry(System.currentTimeMillis() + (cacheMinutes * 60 * 1000), body));
                    return body;
                }
            }
            log.warn("[Hotels-API] Request failed or unsuccessful. Status: {}", response.getStatusCode());
        } catch (Exception e) {
            log.error("[Hotels-API] Error fetching data: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Search Hotels-API.com for hotels.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> searchHotels(String city, String country, String name, Integer minRating, Integer limit, Integer page) {
        Map<String, Object> response = executeSearch(city, country, name, minRating, limit, page);
        if (response != null && response.containsKey("data")) {
            return (List<Map<String, Object>>) response.get("data");
        }
        return Collections.emptyList();
    }

    /**
     * Convenience method to search Jaipur hotels.
     */
    public List<Map<String, Object>> searchJaipurHotels(Integer limit, Integer page) {
        return searchHotels(defaultCity, defaultCountry, null, null, limit, page);
    }

    /**
     * Fetch multiple pages of hotels for a city/country.
     */
    public List<Map<String, Object>> searchMultiplePages(String city, String country, Integer limitPerPage, int maxPages) {
        List<Map<String, Object>> allResults = new ArrayList<>();
        
        for (int page = 1; page <= maxPages; page++) {
            List<Map<String, Object>> pageResults = searchHotels(city, country, null, null, limitPerPage, page);
            if (pageResults.isEmpty()) {
                break; // No more data
            }
            allResults.addAll(pageResults);
            
            // If the returned results are less than the limit, we've reached the last page.
            if (limitPerPage != null && pageResults.size() < limitPerPage) {
                break;
            }
        }
        return allResults;
    }
}
