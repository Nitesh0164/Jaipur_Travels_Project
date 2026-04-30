package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class ChatSessionResponse {
    private Long id;
    private String title;
    private List<ChatMessageResponse> messages;
    private String createdAt;
}
