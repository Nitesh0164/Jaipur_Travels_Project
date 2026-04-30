package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class ChatReplyResponse {
    private Long sessionId;
    private String messageType;
    private String reply;
    private String sourceType; // DB, AI, HYBRID
    private List<String> suggestions;
    private Map<String, Object> relatedData;
}
