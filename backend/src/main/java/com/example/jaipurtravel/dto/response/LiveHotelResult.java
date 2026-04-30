package com.example.jaipurtravel.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * A single hotel result from a MakCorps live city search.
 * All fields are nullable — frontend must guard against null.
 */
@Data
@Builder
public class LiveHotelResult {

    @Schema(description = "MakCorps internal hotel ID")
    private String sourceHotelId;

    private String name;
    private String address;

    @Schema(description = "MakCorps rating (0–10 scale)")
    private BigDecimal rating;

    private Integer reviewCount;
    private BigDecimal latitude;
    private BigDecimal longitude;

    @Schema(description = "Cheapest price found across vendors")
    private BigDecimal price;

    private String currency;

    @Schema(description = "Vendor with the cheapest price")
    private String vendor;

    @Schema(description = "Second-cheapest vendor price")
    private BigDecimal price2;

    @Schema(description = "Second vendor name")
    private String vendor2;

    private String imageUrl;

    /** Always LIVE for MakCorps results */
    private String priceType;
}
