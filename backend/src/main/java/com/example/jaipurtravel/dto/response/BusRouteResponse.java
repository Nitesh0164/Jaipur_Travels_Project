package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * Bus route response — field names match frontend mockBusRoutes.js shape.
 * Uses 'from'/'to' to align with the frontend naming convention.
 */
@Data
@Builder
public class BusRouteResponse {
    private Long id;
    private String routeNo;
    private String routeType;
    private String category;
    private String from;
    private String to;
    private List<String> viaSummary;
    private BigDecimal distanceKm;
    private Integer stopsCount;
    private Integer headwayMinutes;
    private Integer busesOnRoute;
    private BigDecimal fareMin;
    private BigDecimal fareMax;
    private List<String> pathPreview;
    private List<BusStopResponse> stops;
}
