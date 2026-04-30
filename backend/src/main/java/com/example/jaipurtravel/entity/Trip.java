package com.example.jaipurtravel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String city = "jaipur";

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false)
    @Builder.Default
    private Integer days = 1;

    @Column(precision = 12, scale = 2)
    private BigDecimal budget;

    @Column(name = "travel_style", length = 50)
    private String travelStyle;

    @Column(name = "group_type", length = 50)
    private String groupType;

    @Column(name = "interests_json", columnDefinition = "JSON")
    private String interestsJson;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "total_cost", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(name = "itinerary_json", columnDefinition = "LONGTEXT")
    private String itineraryJson;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
