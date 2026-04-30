package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.request.GeneratePlannerRequest;
import com.example.jaipurtravel.dto.request.RefinePlannerRequest;
import com.example.jaipurtravel.dto.response.PlannerResponse;
import com.example.jaipurtravel.service.AnalyticsService;
import com.example.jaipurtravel.service.PlannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
@Tag(name = "Itinerary Planner", description = "Generate and refine day-wise travel itineraries using real place data")
public class PlannerController {

    private final PlannerService plannerService;
    private final AnalyticsService analyticsService;

    @PostMapping("/generate")
    @Operation(summary = "Generate a new itinerary based on city, days, budget, interests, and travel style")
    public ResponseEntity<ApiResponse<PlannerResponse>> generate(
            @Valid @RequestBody GeneratePlannerRequest request) {
        PlannerResponse data = plannerService.generateItinerary(request);
        analyticsService.logEvent("PLANNER_GENERATE", null, request.getCity());
        return ResponseEntity.ok(ApiResponse.ok("Itinerary generated successfully", data));
    }

    @PostMapping("/refine")
    @Operation(summary = "Refine an existing itinerary with a follow-up instruction")
    public ResponseEntity<ApiResponse<PlannerResponse>> refine(
            @Valid @RequestBody RefinePlannerRequest request) {
        PlannerResponse data = plannerService.refineItinerary(request);
        analyticsService.logEvent("PLANNER_REFINE", null, request.getInstruction());
        return ResponseEntity.ok(ApiResponse.ok("Itinerary refined successfully", data));
    }
}
