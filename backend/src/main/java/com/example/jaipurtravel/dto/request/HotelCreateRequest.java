package com.example.jaipurtravel.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class HotelCreateRequest {

    @NotBlank(message = "Hotel name is required")
    private String name;

    private String city;
    private String area;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal rating;
    private Integer starRating;
    private String imageUrl;
    private String amenitiesJson; // JSON string
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private String currency;
}
