package com.example.jaipurtravel.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateBusRouteRequest {

    @NotBlank(message = "Route number is required")
    private String routeNo;

    private String routeType;
    private String category;

    @NotBlank(message = "From stop is required")
    private String fromStop;

    @NotBlank(message = "To stop is required")
    private String toStop;

    private List<String> viaSummary;
    @DecimalMin("0") private BigDecimal distanceKm;
    @Min(0) private Integer stopsCount;
    @Min(0) private Integer headwayMinutes;
    @Min(0) private Integer busesOnRoute;
    @DecimalMin("0") private BigDecimal fareMin;
    @DecimalMin("0") private BigDecimal fareMax;

    /** Ordered list of all stops (from first to last). */
    private List<String> stops;
}
