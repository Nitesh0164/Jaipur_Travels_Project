package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * Full planner output — structured day-wise itinerary with budget and transport info.
 * This same structure is serialized as JSON into Trip.itineraryJson for persistence.
 */
@Data
@Builder
public class PlannerResponse {
    private String title;
    private String city;
    private int days;
    private String summary;
    private String travelStyle;
    private String groupType;
    private List<String> interests;
    private PlannerBudget estimatedBudget;
    private List<PlannerDay> dayPlans;
    private List<String> notes;
    private List<String> transportSummary;

    @Data @Builder
    public static class PlannerDay {
        private int dayNumber;
        private String theme;
        private BigDecimal estimatedDayCost;
        private List<PlannerStop> stops;
        private List<String> notes;
    }

    @Data @Builder
    public static class PlannerStop {
        private Long placeId;
        private String slug;
        private String placeName;
        private String category;
        private String area;
        private String suggestedTimeOfDay;
        private BigDecimal estimatedSpend;
        private String bestTime;
        private String duration;
        private String tip;
        private String transportHint;
    }

    @Data @Builder
    public static class PlannerBudget {
        private BigDecimal totalEstimatedCost;
        private BigDecimal perDayCost;
        private BigDecimal placesSpend;
        private BigDecimal transportSpend;
        private BigDecimal foodSpend;
        private BigDecimal miscSpend;
        private String budgetVerdict;
    }
}
