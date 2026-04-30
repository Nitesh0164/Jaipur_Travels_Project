package com.example.jaipurtravel.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class GeneratePlannerRequest {

    @NotBlank(message = "City is required")
    private String city;

    @Min(value = 1, message = "Days must be at least 1")
    @Max(value = 14, message = "Days must be at most 14")
    private int days;

    @DecimalMin(value = "0", message = "Budget must be non-negative")
    private BigDecimal budget;

    private List<String> interests;

    private String travelStyle;   // budget, comfort, premium, relaxed, fast-paced, family-friendly

    private String groupType;     // solo, couple, family, friends
}
