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
@Table(name = "places")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(length = 200)
    private String area;

    @Column(length = 500)
    private String tagline;

    @Column(name = "short_desc", columnDefinition = "TEXT")
    private String shortDesc;

    @Column(columnDefinition = "TEXT")
    private String overview;

    @Column(name = "entry_fee", precision = 10, scale = 2)
    private BigDecimal entryFee;

    @Column(name = "estimated_spend", precision = 10, scale = 2)
    private BigDecimal estimatedSpend;

    @Column(length = 100)
    private String duration;

    @Column(name = "best_time", length = 200)
    private String bestTime;

    @Column(name = "open_hours", length = 200)
    private String openHours;

    @Column(precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "must_see")
    private Boolean mustSee;

    @Column(length = 1000)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String tip;

    @Column(name = "nearby_json", columnDefinition = "JSON")
    private String nearbyJson;

    @Column(name = "nearby_food_json", columnDefinition = "JSON")
    private String nearbyFoodJson;

    @Column(name = "best_weather_json", columnDefinition = "JSON")
    private String bestWeatherJson;

    @Column(name = "best_time_of_day_json", columnDefinition = "JSON")
    private String bestTimeOfDayJson;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String city = "jaipur";

    @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PlaceTag> tags = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void setTagsList(List<String> tagNames) {
        this.tags.clear();
        if (tagNames != null) {
            tagNames.forEach(t -> this.tags.add(PlaceTag.builder().place(this).tag(t).build()));
        }
    }
}
