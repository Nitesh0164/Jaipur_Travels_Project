package com.example.jaipurtravel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bus_stops")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BusStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private BusRoute route;

    @Column(name = "stop_name", nullable = false, length = 200)
    private String stopName;

    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;
}
