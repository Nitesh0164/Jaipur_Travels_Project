package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BusStopResponse {
    private Long id;
    private String stopName;
    private Integer stopOrder;
}
