package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class AnalyticsOverviewResponse {
    private long totalEvents;
    private List<AdminDashboardResponse.EventCount> countsByEventType;
    private List<AnalyticsEventResponse> recentEvents;
    private List<QueryCount> popularQueries;

    @Data @Builder
    public static class QueryCount {
        private String query;
        private long count;
    }
}
