package com.example.jaipurtravel.service;

import com.example.jaipurtravel.dto.request.GeneratePlannerRequest;
import com.example.jaipurtravel.dto.request.RefinePlannerRequest;
import com.example.jaipurtravel.dto.response.PlannerResponse;

public interface PlannerService {

    PlannerResponse generateItinerary(GeneratePlannerRequest request);

    PlannerResponse refineItinerary(RefinePlannerRequest request);
}
