package com.example.jaipurtravel.service;

import com.example.jaipurtravel.dto.request.CreateTripRequest;
import com.example.jaipurtravel.dto.request.UpdateTripRequest;
import com.example.jaipurtravel.dto.response.TripResponse;
import com.example.jaipurtravel.dto.response.TripSummaryResponse;

import java.util.List;

public interface TripService {

    List<TripSummaryResponse> getTripsForUser(String email);

    TripResponse getTripById(Long id, String email);

    TripResponse createTrip(CreateTripRequest request, String email);

    TripResponse updateTrip(Long id, UpdateTripRequest request, String email);

    void deleteTrip(Long id, String email);
}
