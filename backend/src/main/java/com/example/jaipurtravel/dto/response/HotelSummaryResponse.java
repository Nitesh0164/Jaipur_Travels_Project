package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/** Compact hotel card for grid/list views */
@Data
@Builder
public class HotelSummaryResponse {
    private Long id;
    private String name;
    private String area;
    private BigDecimal rating;
    private Integer starRating;
    private String imageUrl;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private String currency;
    private String priceType;
    private String cheapestVendor;
}
