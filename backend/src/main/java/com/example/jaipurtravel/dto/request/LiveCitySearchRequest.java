package com.example.jaipurtravel.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request body for POST /api/hotels/live-city-search.
 * All fields except dates are optional — sensible defaults are applied.
 */
@Data
public class LiveCitySearchRequest {

    @Schema(description = "MakCorps city ID. If omitted, uses MAKCORPS_JAIPUR_CITY_ID from config.")
    private String cityId;

    @Schema(description = "Display name (not sent to MakCorps)", example = "Jaipur")
    private String city;

    @Schema(description = "Check-in date YYYY-MM-DD", example = "2026-05-10")
    private String checkIn;

    @Schema(description = "Check-out date YYYY-MM-DD", example = "2026-05-11")
    private String checkOut;

    @Schema(example = "2")
    private Integer adults;

    @Schema(example = "1")
    private Integer rooms;

    @Schema(example = "0")
    private Integer children;

    @Schema(example = "INR")
    private String currency;

    @Schema(example = "true")
    private Boolean tax;

    @Schema(description = "Max pages to fetch from MakCorps (capped at 10 server-side)", example = "5")
    private Integer maxPages;

    // ── Optional post-fetch filters ───────────────────────────────────

    @Schema(description = "Filter: minimum price per night")
    private BigDecimal budgetMin;

    @Schema(description = "Filter: maximum price per night")
    private BigDecimal budgetMax;

    @Schema(description = "Filter: minimum rating (0-10)")
    private BigDecimal rating;

    @Schema(description = "Filter: text contained in hotel name or address")
    private String searchText;

    @Schema(description = "Filter: area keyword contained in hotel address")
    private String area;
}
