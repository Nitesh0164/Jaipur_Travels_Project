package com.example.jaipurtravel.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class HotelUpdateRequest {
    private String name;
    private String area;
    private String address;
    private BigDecimal rating;
    private Integer starRating;
    private String imageUrl;
    private String amenitiesJson;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private String currency;
}
