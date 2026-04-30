package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.response.WeatherResponse;
import com.example.jaipurtravel.dto.response.WeatherTravelAdviceResponse;
import com.example.jaipurtravel.service.AnalyticsService;
import com.example.jaipurtravel.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
@Tag(name = "Weather", description = "Weather data with caching and travel advice")
public class WeatherController {

    private final WeatherService weatherService;
    private final AnalyticsService analyticsService;

    @GetMapping("/current")
    @Operation(summary = "Get current weather for a city")
    public ResponseEntity<ApiResponse<WeatherResponse>> current(
            @RequestParam(defaultValue = "Jaipur") String city) {
        analyticsService.logEvent("WEATHER_QUERY", null, city);
        return ResponseEntity.ok(ApiResponse.ok("Current weather",
                weatherService.getCurrentWeather(city)));
    }

    @GetMapping("/forecast")
    @Operation(summary = "Get 5-day weather forecast for a city")
    public ResponseEntity<ApiResponse<WeatherResponse>> forecast(
            @RequestParam(defaultValue = "Jaipur") String city) {
        return ResponseEntity.ok(ApiResponse.ok("Weather forecast",
                weatherService.getForecast(city)));
    }

    @GetMapping("/travel-advice")
    @Operation(summary = "Get weather-based travel advice with place suggestions")
    public ResponseEntity<ApiResponse<WeatherTravelAdviceResponse>> travelAdvice(
            @RequestParam(defaultValue = "Jaipur") String city) {
        return ResponseEntity.ok(ApiResponse.ok("Travel advice",
                weatherService.getTravelAdvice(city)));
    }
}
