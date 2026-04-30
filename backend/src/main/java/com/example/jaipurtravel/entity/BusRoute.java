package com.example.jaipurtravel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bus_routes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BusRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "route_no", nullable = false, length = 20)
    private String routeNo;

    @Column(name = "route_type", nullable = false, length = 50)
    @Builder.Default
    private String routeType = "Regular";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String category = "Urban";

    @Column(name = "from_stop", nullable = false, length = 200)
    private String fromStop;

    @Column(name = "to_stop", nullable = false, length = 200)
    private String toStop;

    @Column(name = "via_summary_json", columnDefinition = "JSON")
    private String viaSummaryJson;

    @Column(name = "distance_km", precision = 6, scale = 1)
    private BigDecimal distanceKm;

    @Column(name = "stops_count")
    private Integer stopsCount;

    @Column(name = "headway_minutes")
    private Integer headwayMinutes;

    @Column(name = "buses_on_route")
    private Integer busesOnRoute;

    @Column(name = "fare_min", precision = 8, scale = 2)
    private BigDecimal fareMin;

    @Column(name = "fare_max", precision = 8, scale = 2)
    private BigDecimal fareMax;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stopOrder ASC")
    @Builder.Default
    private List<BusStop> stops = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void setStopsList(List<String> stopNames) {
        this.stops.clear();
        if (stopNames != null) {
            for (int i = 0; i < stopNames.size(); i++) {
                this.stops.add(BusStop.builder()
                        .route(this)
                        .stopName(stopNames.get(i).trim())
                        .stopOrder(i + 1)
                        .build());
            }
        }
    }
}
