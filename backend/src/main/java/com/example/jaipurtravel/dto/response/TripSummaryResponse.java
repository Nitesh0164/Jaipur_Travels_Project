package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

/** Lightweight trip summary for list views. */
@Data
@Builder
public class TripSummaryResponse {
    private Long id;
    private String title;
    private String city;
    private int days;
    private String travelStyle;
    private BigDecimal totalCost;
    private String createdAt;
}
