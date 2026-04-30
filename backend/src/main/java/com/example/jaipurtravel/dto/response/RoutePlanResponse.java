package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * Route planning result — can contain direct routes, one-change routes, or both.
 */
@Data
@Builder
public class RoutePlanResponse {

    private String source;
    private String destination;
    private List<DirectRouteResult> directRoutes;
    private List<OneChangeRouteResult> oneChangeRoutes;
    private String summary;

    @Data @Builder
    public static class DirectRouteResult {
        private Long routeId;
        private String routeNo;
        private String routeType;
        private String from;
        private String to;
        private int boardAtOrder;
        private int alightAtOrder;
        private int stopsToTravel;
        private BigDecimal fareMin;
        private BigDecimal fareMax;
        private List<String> stopsOnWay;
    }

    @Data @Builder
    public static class OneChangeRouteResult {
        private DirectRouteResult firstLeg;
        private DirectRouteResult secondLeg;
        private String interchangeStop;
        private int totalStops;
        private BigDecimal estimatedFareMin;
        private BigDecimal estimatedFareMax;
    }
}
