package com.example.jaipurtravel.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateBusRouteRequest {
    private String routeNo;
    private String routeType;
    private String category;
    private String fromStop;
    private String toStop;
    private List<String> viaSummary;
    private BigDecimal distanceKm;
    private Integer stopsCount;
    private Integer headwayMinutes;
    private Integer busesOnRoute;
    private BigDecimal fareMin;
    private BigDecimal fareMax;
    private List<String> stops;
}
