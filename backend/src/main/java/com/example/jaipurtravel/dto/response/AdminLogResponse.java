package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AdminLogResponse {
    private Long id;
    private String adminName;
    private String adminEmail;
    private String action;
    private String entityType;
    private Long entityId;
    private String metaJson;
    private String createdAt;
}
