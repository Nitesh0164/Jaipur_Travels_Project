package com.example.jaipurtravel.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class RefinePlannerRequest {

    @NotBlank(message = "City is required")
    private String city;

    private int days;
    private BigDecimal budget;
    private List<String> interests;
    private String travelStyle;
    private String groupType;

    /** Free-text refinement instruction, e.g. "add more food places" */
    @NotBlank(message = "Refinement instruction is required")
    private String instruction;

    /** The current itinerary JSON (optional — if omitted, generates fresh with modified params). */
    private String currentItineraryJson;
}
