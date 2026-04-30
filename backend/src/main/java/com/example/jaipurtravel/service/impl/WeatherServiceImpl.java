package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.response.WeatherResponse;
import com.example.jaipurtravel.dto.response.WeatherResponse.*;
import com.example.jaipurtravel.dto.response.WeatherTravelAdviceResponse;
import com.example.jaipurtravel.dto.response.WeatherTravelAdviceResponse.PlaceSuggestion;
import com.example.jaipurtravel.entity.Place;
import com.example.jaipurtravel.entity.PlaceTag;
import com.example.jaipurtravel.entity.WeatherCache;
import com.example.jaipurtravel.integration.WeatherApiClient;
import com.example.jaipurtravel.repository.PlaceRepository;
import com.example.jaipurtravel.repository.WeatherCacheRepository;
import com.example.jaipurtravel.service.WeatherService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherServiceImpl implements WeatherService {

    private final WeatherApiClient weatherApiClient;
    private final WeatherCacheRepository cacheRepo;
    private final PlaceRepository placeRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.weather.cache-minutes:30}")
    private int cacheMinutes;

    @Override
    @Transactional
    public WeatherResponse getCurrentWeather(String city) {
        String cacheType = "CURRENT";
        Map<String, Object> data = getCachedOrFetch(city, cacheType, () -> weatherApiClient.fetchCurrent(city));

        if (data == null) return buildMockCurrent(city);

        CurrentWeather cw = parseCurrentFromApi(data);
        return WeatherResponse.builder()
                .city(city).type("CURRENT").current(cw)
                .fetchedAt(LocalDateTime.now().toString()).build();
    }

    @Override
    @Transactional
    public WeatherResponse getForecast(String city) {
        String cacheType = "FORECAST";
        Map<String, Object> data = getCachedOrFetch(city, cacheType, () -> weatherApiClient.fetchForecast(city));

        if (data == null) return buildMockForecast(city);

        List<ForecastDay> days = parseForecastFromApi(data);
        return WeatherResponse.builder()
                .city(city).type("FORECAST").forecast(days)
                .fetchedAt(LocalDateTime.now().toString()).build();
    }

    @Override
    @Transactional
    public WeatherTravelAdviceResponse getTravelAdvice(String city) {
        WeatherResponse current = getCurrentWeather(city);
        String condition = current.getCurrent() != null ? current.getCurrent().getCondition() : "pleasant";
        BigDecimal temp = current.getCurrent() != null ? current.getCurrent().getTempC() : BigDecimal.valueOf(28);

        List<String> recommendations = new ArrayList<>();
        String overallAdvice;
        String weatherTag;

        if (temp != null && temp.compareTo(BigDecimal.valueOf(40)) > 0) {
            overallAdvice = "It's extremely hot in " + city + ". Prefer indoor/air-conditioned attractions and visit outdoor spots early morning or evening.";
            recommendations.add("Carry plenty of water and sunscreen");
            recommendations.add("Visit forts before 9 AM or after 4 PM");
            recommendations.add("Museums and indoor cafes are ideal during peak heat");
            weatherTag = "summer";
        } else if (temp != null && temp.compareTo(BigDecimal.valueOf(35)) > 0) {
            overallAdvice = "Hot weather in " + city + ". Mix outdoor sightseeing with indoor breaks.";
            recommendations.add("Morning sightseeing recommended (7–10 AM)");
            recommendations.add("Schedule café/restaurant breaks during midday");
            weatherTag = "summer";
        } else if (condition != null && condition.toLowerCase().contains("rain")) {
            overallAdvice = "Rainy conditions in " + city + ". Indoor attractions and covered markets are your best bet.";
            recommendations.add("Carry an umbrella and waterproof bags");
            recommendations.add("Avoid hilltop forts in heavy rain (slippery paths)");
            recommendations.add("Great time for museums, cafes, and covered bazaars");
            weatherTag = "rainy";
        } else {
            overallAdvice = "Pleasant weather in " + city + "! Perfect for outdoor sightseeing.";
            recommendations.add("Great time for forts, palaces, and walking tours");
            recommendations.add("Sunset at Nahargarh Fort is especially recommended");
            weatherTag = "winter";
        }

        // Suggest places based on weather
        List<PlaceSuggestion> suggestions = suggestPlacesForWeather(city, weatherTag, condition);

        return WeatherTravelAdviceResponse.builder()
                .city(city).condition(condition)
                .overallAdvice(overallAdvice)
                .recommendations(recommendations)
                .suggestedPlaces(suggestions)
                .build();
    }

    @Override
    public String getWeatherSummary(String city) {
        try {
            WeatherResponse w = getCurrentWeather(city);
            if (w.getCurrent() != null) {
                CurrentWeather c = w.getCurrent();
                return String.format("Current weather in %s: %s, %.0f°C, humidity %d%%",
                        city, c.getDescription(), c.getTempC(), c.getHumidity());
            }
        } catch (Exception e) {
            log.warn("Could not fetch weather summary: {}", e.getMessage());
        }
        return "Weather data unavailable for " + city;
    }

    // ── Caching ─────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> getCachedOrFetch(String city, String cacheType, java.util.function.Supplier<Map<String, Object>> fetcher) {
        Optional<WeatherCache> cached = cacheRepo.findByCityIgnoreCaseAndCacheType(city.toLowerCase(), cacheType);
        if (cached.isPresent() && !cached.get().isExpired()) {
            try {
                return objectMapper.readValue(cached.get().getPayloadJson(), new TypeReference<>() {});
            } catch (JsonProcessingException e) { /* fall through to fetch */ }
        }

        Map<String, Object> data = fetcher.get();
        if (data != null) {
            try {
                String json = objectMapper.writeValueAsString(data);
                LocalDateTime now = LocalDateTime.now();
                WeatherCache cache = cached.orElse(WeatherCache.builder()
                        .city(city.toLowerCase()).cacheType(cacheType).build());
                cache.setPayloadJson(json);
                cache.setFetchedAt(now);
                cache.setExpiresAt(now.plusMinutes(cacheMinutes));
                cacheRepo.save(cache);
            } catch (JsonProcessingException ignored) {}
        }
        return data;
    }

    // ── API parsing ─────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private CurrentWeather parseCurrentFromApi(Map<String, Object> data) {
        Map<String, Object> main = (Map<String, Object>) data.getOrDefault("main", Map.of());
        Map<String, Object> wind = (Map<String, Object>) data.getOrDefault("wind", Map.of());
        List<Map<String, Object>> weatherList = (List<Map<String, Object>>) data.getOrDefault("weather", List.of());
        String desc = !weatherList.isEmpty() ? (String) weatherList.get(0).getOrDefault("description", "clear") : "clear";
        String icon = !weatherList.isEmpty() ? (String) weatherList.get(0).getOrDefault("icon", "01d") : "01d";
        String condition = !weatherList.isEmpty() ? (String) weatherList.get(0).getOrDefault("main", "Clear") : "Clear";

        return CurrentWeather.builder()
                .tempC(toBigDecimal(main.get("temp")))
                .feelsLikeC(toBigDecimal(main.get("feels_like")))
                .humidity(toInt(main.get("humidity")))
                .description(desc).icon(icon).condition(condition)
                .windSpeedKmh(toBigDecimal(wind.get("speed")).multiply(BigDecimal.valueOf(3.6)).setScale(1, RoundingMode.HALF_UP))
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<ForecastDay> parseForecastFromApi(Map<String, Object> data) {
        List<Map<String, Object>> list = (List<Map<String, Object>>) data.getOrDefault("list", List.of());
        Map<String, List<Map<String, Object>>> byDate = new LinkedHashMap<>();
        for (Map<String, Object> item : list) {
            String dtTxt = (String) item.getOrDefault("dt_txt", "");
            String date = dtTxt.length() >= 10 ? dtTxt.substring(0, 10) : dtTxt;
            byDate.computeIfAbsent(date, k -> new ArrayList<>()).add(item);
        }

        List<ForecastDay> days = new ArrayList<>();
        for (var entry : byDate.entrySet()) {
            if (days.size() >= 5) break;
            List<Map<String, Object>> dayItems = entry.getValue();
            double minT = Double.MAX_VALUE, maxT = Double.MIN_VALUE;
            int avgHumidity = 0; String desc = "clear"; String icon = "01d"; String cond = "Clear";
            for (Map<String, Object> item : dayItems) {
                Map<String, Object> m = (Map<String, Object>) item.getOrDefault("main", Map.of());
                double t = toDouble(m.get("temp"));
                minT = Math.min(minT, t); maxT = Math.max(maxT, t);
                avgHumidity += toInt(m.get("humidity"));
                List<Map<String, Object>> wl = (List<Map<String, Object>>) item.getOrDefault("weather", List.of());
                if (!wl.isEmpty()) { desc = (String)wl.get(0).getOrDefault("description",""); icon = (String)wl.get(0).getOrDefault("icon","01d"); cond = (String)wl.get(0).getOrDefault("main","Clear"); }
            }
            days.add(ForecastDay.builder()
                    .date(entry.getKey())
                    .tempMinC(BigDecimal.valueOf(minT).setScale(1, RoundingMode.HALF_UP))
                    .tempMaxC(BigDecimal.valueOf(maxT).setScale(1, RoundingMode.HALF_UP))
                    .humidity(dayItems.isEmpty() ? 0 : avgHumidity / dayItems.size())
                    .description(desc).icon(icon).condition(cond).build());
        }
        return days;
    }

    // ── Place suggestions ───────────────────────────────────────────

    private List<PlaceSuggestion> suggestPlacesForWeather(String city, String weatherTag, String condition) {
        List<Place> places = placeRepository.findByCityIgnoreCase(city);
        List<PlaceSuggestion> suggestions = new ArrayList<>();

        for (Place p : places) {
            String bwJson = p.getBestWeatherJson();
            if (bwJson != null && bwJson.toLowerCase().contains(weatherTag)) {
                String reason = switch (weatherTag) {
                    case "summer" -> "Great choice during hot weather";
                    case "rainy"  -> "Perfect for rainy days";
                    default       -> "Ideal in current weather";
                };
                boolean isIndoor = p.getCategory() != null &&
                        (p.getCategory().contains("Cafe") || p.getCategory().contains("Museum") || p.getCategory().contains("Bar"));
                if ("summer".equals(weatherTag) && isIndoor) reason = "Air-conditioned / indoor — perfect for hot days";

                suggestions.add(PlaceSuggestion.builder()
                        .placeId(p.getId()).slug(p.getSlug())
                        .name(p.getName()).category(p.getCategory()).reason(reason).build());
            }
            if (suggestions.size() >= 6) break;
        }
        return suggestions;
    }

    // ── Mock data (when API key not configured) ─────────────────────

    private WeatherResponse buildMockCurrent(String city) {
        return WeatherResponse.builder().city(city).type("CURRENT")
                .current(CurrentWeather.builder()
                        .tempC(BigDecimal.valueOf(32)).feelsLikeC(BigDecimal.valueOf(35))
                        .humidity(45).description("haze").icon("50d").condition("Haze")
                        .windSpeedKmh(BigDecimal.valueOf(12)).build())
                .fetchedAt(LocalDateTime.now().toString()).build();
    }

    private WeatherResponse buildMockForecast(String city) {
        return WeatherResponse.builder().city(city).type("FORECAST")
                .forecast(List.of(
                        ForecastDay.builder().date("today").tempMinC(BigDecimal.valueOf(25)).tempMaxC(BigDecimal.valueOf(38)).humidity(40).description("haze").condition("Haze").build(),
                        ForecastDay.builder().date("tomorrow").tempMinC(BigDecimal.valueOf(26)).tempMaxC(BigDecimal.valueOf(39)).humidity(38).description("clear sky").condition("Clear").build()))
                .fetchedAt(LocalDateTime.now().toString()).build();
    }

    private BigDecimal toBigDecimal(Object o) { return o != null ? new BigDecimal(o.toString()) : BigDecimal.ZERO; }
    private int toInt(Object o) { return o != null ? ((Number) o).intValue() : 0; }
    private double toDouble(Object o) { return o != null ? ((Number) o).doubleValue() : 0; }
}
