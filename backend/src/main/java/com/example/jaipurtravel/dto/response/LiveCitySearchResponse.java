package com.example.jaipurtravel.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Full response envelope for POST /api/hotels/live-city-search.
 */
@Data
@Builder
public class LiveCitySearchResponse {

    private String city;
    private String cityId;

    @Schema(description = "Always MAKCORPS for this endpoint")
    private String source;

    @Schema(description = "LIVE or ESTIMATED if fallback was used")
    private String priceType;

    @Schema(description = "Total hotel count reported by MakCorps for this city")
    private Integer totalHotelCount;

    @Schema(description = "Total pages reported by MakCorps")
    private Integer totalMakCorpsPages;

    @Schema(description = "Number of pages we actually fetched")
    private Integer totalPagesFetched;

    @Schema(description = "Number of hotels returned after filtering")
    private Integer totalResultsReturned;

    private List<LiveHotelResult> hotels;

    @Schema(description = "Non-null when a degraded/fallback response is returned")
    private String warning;

    private String searchedAt;
}
