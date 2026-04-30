package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder
public class WeatherResponse {
    private String city;
    private String type; // CURRENT or FORECAST
    private CurrentWeather current;
    private List<ForecastDay> forecast;
    private String fetchedAt;

    @Data @Builder
    public static class CurrentWeather {
        private BigDecimal tempC;
        private BigDecimal feelsLikeC;
        private int humidity;
        private String description;
        private String icon;
        private BigDecimal windSpeedKmh;
        private String condition;
    }

    @Data @Builder
    public static class ForecastDay {
        private String date;
        private BigDecimal tempMinC;
        private BigDecimal tempMaxC;
        private int humidity;
        private String description;
        private String icon;
        private String condition;
    }
}
