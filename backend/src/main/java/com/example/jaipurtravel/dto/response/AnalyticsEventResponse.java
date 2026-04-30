package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AnalyticsEventResponse {
    private Long id;
    private String eventType;
    private String queryText;
    private String userName;
    private String metaJson;
    private String createdAt;
}
