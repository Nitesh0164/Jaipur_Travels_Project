package com.example.jaipurtravel.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

/**
 * Wraps the OpenWeatherMap API. API key stays on the backend only.
 */
@Slf4j
@Component
public class WeatherApiClient {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;

    public WeatherApiClient(
            RestTemplate restTemplate,
            @Value("${app.weather.api-key:d87e9a14a97511d19a82c4e581587700}") String apiKey,
            @Value("${app.weather.base-url:https://api.openweathermap.org/data/2.5}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /** Returns raw JSON map from /weather endpoint, or null on failure. */
    @SuppressWarnings("unchecked")
    public Map<String, Object> fetchCurrent(String city) {
        return fetchEndpoint("/weather", city);
    }

    /** Returns raw JSON map from /forecast endpoint, or null on failure. */
    @SuppressWarnings("unchecked")
    public Map<String, Object> fetchForecast(String city) {
        return fetchEndpoint("/forecast", city);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchEndpoint(String path, String city) {
        if (!isConfigured()) {
            log.warn("Weather API key not configured — returning mock data");
            return null;
        }
        try {
            String url = baseUrl + path + "?q=" + city + "&appid=" + apiKey + "&units=metric";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            }
            return null;
        } catch (Exception e) {
            log.error("Weather API call failed for {}: {}", city, e.getMessage());
            return null;
        }
    }
}
