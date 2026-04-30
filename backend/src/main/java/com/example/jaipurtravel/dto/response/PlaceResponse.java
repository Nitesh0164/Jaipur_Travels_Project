package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * Full place detail response — field names match frontend mockPlaces.js shape
 * so the frontend can swap mock data for API data with minimal changes.
 */
@Data
@Builder
public class PlaceResponse {
    private Long id;
    private String slug;
    private String name;
    private String category;
    private String area;
    private String tagline;
    private String shortDesc;
    private String overview;
    private BigDecimal entryFee;
    private BigDecimal estimatedSpend;
    private String duration;
    private String bestTime;
    private String openHours;
    private BigDecimal rating;
    private Integer reviewCount;
    private Boolean mustSee;
    private String image;
    private String tip;
    private List<String> tags;
    private List<String> nearby;
    private List<String> nearbyFood;
    private List<String> bestWeather;
    private List<String> bestTimeOfDay;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String city;
    private String createdAt;
}
