package com.example.jaipurtravel.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class HotelSearchLiveRequest {
    private String city;
    private String area;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer adults;
    private Integer rooms;
    private Integer children;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private String currency;
    private BigDecimal rating;
    private String searchText;
}
