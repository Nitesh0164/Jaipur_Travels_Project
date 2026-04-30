package com.example.jaipurtravel.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateTripRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 300)
    private String title;

    @NotBlank(message = "City is required")
    private String city;

    @Min(value = 1, message = "Days must be at least 1")
    private int days;

    private BigDecimal budget;
    private String travelStyle;
    private String groupType;
    private List<String> interests;
    private String summary;
    private BigDecimal totalCost;

    /** Full itinerary JSON (serialized PlannerResponse or equivalent). */
    private String itineraryJson;

    private String notes;
}
