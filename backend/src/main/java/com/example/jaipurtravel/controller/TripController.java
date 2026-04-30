package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.request.CreateTripRequest;
import com.example.jaipurtravel.dto.request.UpdateTripRequest;
import com.example.jaipurtravel.dto.response.TripResponse;
import com.example.jaipurtravel.dto.response.TripSummaryResponse;
import com.example.jaipurtravel.service.AnalyticsService;
import com.example.jaipurtravel.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@Tag(name = "Trips", description = "Authenticated user's saved trip management")
public class TripController {

    private final TripService tripService;
    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "List all trips for the authenticated user")
    public ResponseEntity<ApiResponse<List<TripSummaryResponse>>> list(Authentication auth) {
        String email = extractEmail(auth);
        return ResponseEntity.ok(ApiResponse.ok("Trips fetched", tripService.getTripsForUser(email)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific trip (must be owned by the authenticated user)")
    public ResponseEntity<ApiResponse<TripResponse>> get(@PathVariable Long id, Authentication auth) {
        String email = extractEmail(auth);
        return ResponseEntity.ok(ApiResponse.ok("Trip fetched", tripService.getTripById(id, email)));
    }

    @PostMapping
    @Operation(summary = "Save a new trip (e.g., from planner output)")
    public ResponseEntity<ApiResponse<TripResponse>> create(
            @Valid @RequestBody CreateTripRequest request, Authentication auth) {
        String email = extractEmail(auth);
        TripResponse data = tripService.createTrip(request, email);
        analyticsService.logEvent("TRIP_CREATED", email, request.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Trip saved", data));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update trip title, notes, or summary")
    public ResponseEntity<ApiResponse<TripResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTripRequest request,
            Authentication auth) {
        String email = extractEmail(auth);
        analyticsService.logEvent("TRIP_UPDATED", email);
        return ResponseEntity.ok(ApiResponse.ok("Trip updated", tripService.updateTrip(id, request, email)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a trip (must be owned by the authenticated user)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication auth) {
        String email = extractEmail(auth);
        tripService.deleteTrip(id, email);
        analyticsService.logEvent("TRIP_DELETED", email);
        return ResponseEntity.ok(ApiResponse.ok("Trip deleted"));
    }

    private String extractEmail(Authentication auth) {
        return ((UserDetails) auth.getPrincipal()).getUsername();
    }
}
