package com.example.jaipurtravel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hotels")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Where the hotel data came from: MANUAL, MAKCORPS, etc. */
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String source = "MANUAL";

    /** External provider's hotel ID (for de-duplication on sync) */
    @Column(name = "source_hotel_id", length = 200)
    private String sourceHotelId;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String city = "jaipur";

    @Column(length = 200)
    private String area;

    @Column(length = 500)
    private String address;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "star_rating")
    private Integer starRating;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    /** JSON array of amenity strings, e.g. ["WiFi","Pool","AC"] */
    @Column(name = "amenities_json", columnDefinition = "JSON")
    private String amenitiesJson;

    @Column(name = "price_min", precision = 10, scale = 2)
    private BigDecimal priceMin;

    @Column(name = "price_max", precision = 10, scale = 2)
    private BigDecimal priceMax;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    /**
     * LIVE    — price came from MakCorps for the requested dates
     * ESTIMATED — price is our fallback estimate
     * UNAVAILABLE — we tried live but no data returned
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "price_type", nullable = false, length = 20)
    @Builder.Default
    private PriceType priceType = PriceType.ESTIMATED;

    @Column(name = "cheapest_vendor", length = 200)
    private String cheapestVendor;

    @Column(name = "last_price_fetched_at")
    private LocalDateTime lastPriceFetchedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PriceType {
        LIVE, ESTIMATED, UNAVAILABLE
    }
}
