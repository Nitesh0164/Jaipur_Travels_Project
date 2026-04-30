package com.example.jaipurtravel.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoutePlanRequest {

    @NotBlank(message = "Source stop is required")
    private String source;

    @NotBlank(message = "Destination stop is required")
    private String destination;
}
