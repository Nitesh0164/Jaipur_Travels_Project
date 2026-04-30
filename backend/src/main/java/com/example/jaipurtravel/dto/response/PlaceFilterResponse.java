package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/** Available filter options for the frontend filter UI. */
@Data
@Builder
public class PlaceFilterResponse {
    private List<String> categories;
    private List<String> areas;
    private List<String> tags;
}
