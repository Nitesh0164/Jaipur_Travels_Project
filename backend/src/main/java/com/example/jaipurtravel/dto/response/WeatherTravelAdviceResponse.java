package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class WeatherTravelAdviceResponse {
    private String city;
    private String condition;
    private String overallAdvice;
    private List<String> recommendations;
    private List<PlaceSuggestion> suggestedPlaces;

    @Data @Builder
    public static class PlaceSuggestion {
        private Long placeId;
        private String slug;
        private String name;
        private String category;
        private String reason;
    }
}
