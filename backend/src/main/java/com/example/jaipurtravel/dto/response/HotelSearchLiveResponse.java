package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/** Wraps a live search response with metadata about the source */
@Data
@Builder
public class HotelSearchLiveResponse {
    private List<HotelResponse> hotels;
    private int totalFound;
    private String priceSource;  // "LIVE", "CACHED", "ESTIMATED"
    private String message;      // user-friendly note when fallback is used
    private String searchedAt;
}
