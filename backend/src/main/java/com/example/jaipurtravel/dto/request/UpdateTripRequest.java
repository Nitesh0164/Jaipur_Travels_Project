package com.example.jaipurtravel.dto.request;

import lombok.Data;

@Data
public class UpdateTripRequest {
    private String title;
    private String summary;
    private String notes;
    private String itineraryJson;
}
