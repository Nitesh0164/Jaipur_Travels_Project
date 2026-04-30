package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ChatMessageResponse {
    private Long id;
    private String role;
    private String content;
    private String messageType;
    private String createdAt;
}
