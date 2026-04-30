package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/** Live or cached price data for a hotel */
@Data
@Builder
public class HotelPriceResponse {
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String currency;
    private String cheapestVendor;
    private String priceType; // LIVE or ESTIMATED
    private List<HotelOfferResponse> offers;
    private String fetchedAt;
    private String expiresAt;
}
