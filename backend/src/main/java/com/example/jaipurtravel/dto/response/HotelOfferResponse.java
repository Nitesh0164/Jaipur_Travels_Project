package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

/** Single vendor offer for a hotel — used inside HotelPriceResponse */
@Data
@Builder
public class HotelOfferResponse {
    private String vendor;
    private BigDecimal price;
    private String currency;
    private String deepLink;
}
