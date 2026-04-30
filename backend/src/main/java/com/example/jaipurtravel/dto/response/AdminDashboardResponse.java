package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class AdminDashboardResponse {
    private Overview overview;
    private List<AdminUserResponse> recentUsers;
    private List<TripSummaryResponse> recentTrips;
    private List<EventCount> topEventTypes;
    private Map<String, Long> countsByPlaceCategory;
    private Map<String, Long> countsByArea;

    @Data @Builder
    public static class Overview {
        private long totalUsers;
        private long totalPlaces;
        private long totalBusRoutes;
        private long totalTrips;
        private long totalChatSessions;
        private long totalChatMessages;
        private long totalAnalyticsEvents;
    }

    @Data @Builder
    public static class EventCount {
        private String eventType;
        private long count;
    }
}
