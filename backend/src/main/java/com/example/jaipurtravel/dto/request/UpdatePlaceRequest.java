package com.example.jaipurtravel.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdatePlaceRequest {

    @Size(max = 200)
    private String name;
    private String category;
    private String area;
    private String tagline;
    private String shortDesc;
    private String overview;
    @DecimalMin("0") private BigDecimal entryFee;
    @DecimalMin("0") private BigDecimal estimatedSpend;
    private String duration;
    private String bestTime;
    private String openHours;
    @DecimalMin("0") @DecimalMax("5") private BigDecimal rating;
    @Min(0) private Integer reviewCount;
    private Boolean mustSee;
    private String image;
    private String tip;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String city;
    private List<String> tags;
    private List<String> nearby;
    private List<String> nearbyFood;
    private List<String> bestWeather;
    private List<String> bestTimeOfDay;
}
