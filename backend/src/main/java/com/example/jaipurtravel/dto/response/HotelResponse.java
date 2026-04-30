package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Full hotel detail response — safe mapping from Hotel entity.
 * All fields may be null; frontend must handle gracefully.
 */
@Data
@Builder
public class HotelResponse {

    private Long id;
    private String name;
    private String city;
    private String area;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal rating;
    private Integer starRating;
    private String imageUrl;
    private List<String> amenities;

    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private String currency;

    /**
     * LIVE, ESTIMATED, or UNAVAILABLE
     */
    private String priceType;

    private String cheapestVendor;
    private String lastPriceFetchedAt;
    private String source;
    private String createdAt;

    /** Populated only on live search results */
    private HotelPriceResponse livePrice;
}
