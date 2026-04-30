package com.example.jaipurtravel.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatMessageRequest {
    private Long sessionId;

    @NotBlank(message = "Message is required")
    private String message;

    private String city;
    private Long contextTripId;
}
