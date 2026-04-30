package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/** Full trip detail response. */
@Data
@Builder
public class TripResponse {
    private Long id;
    private String title;
    private String city;
    private int days;
    private BigDecimal budget;
    private String travelStyle;
    private String groupType;
    private List<String> interests;
    private String summary;
    private BigDecimal totalCost;
    private String itineraryJson;
    private String notes;
    private String createdAt;
    private String updatedAt;
}
