package com.example.jaipurtravel.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class HotelSearchRequest {
    private String city;
    private String area;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private BigDecimal rating;
    private String searchText;
}
