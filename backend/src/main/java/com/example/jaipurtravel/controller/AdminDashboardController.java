package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.response.*;
import com.example.jaipurtravel.service.impl.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Admin-only dashboard, analytics, audit logs, and management endpoints")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get full admin dashboard — overview counts, recent activity, breakdowns")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard fetched", dashboardService.getDashboard()));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get analytics overview — event counts, popular queries, recent events")
    public ResponseEntity<ApiResponse<AnalyticsOverviewResponse>> analytics() {
        return ResponseEntity.ok(ApiResponse.ok("Analytics fetched", dashboardService.getAnalyticsOverview()));
    }

    @GetMapping("/analytics/events")
    @Operation(summary = "Get recent analytics events, optionally filtered by eventType")
    public ResponseEntity<ApiResponse<List<AnalyticsEventResponse>>> analyticsEvents(
            @RequestParam(required = false) String eventType,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(ApiResponse.ok("Events fetched",
                dashboardService.getRecentEvents(eventType, Math.min(limit, 200))));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get recent admin audit logs")
    public ResponseEntity<ApiResponse<List<AdminLogResponse>>> logs(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(ApiResponse.ok("Admin logs fetched",
                dashboardService.getAdminLogs(Math.min(limit, 200))));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users — admin-safe fields only (no passwords)")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> users() {
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", dashboardService.getUsers()));
    }

    @GetMapping("/trips")
    @Operation(summary = "List recent trips for admin oversight")
    public ResponseEntity<ApiResponse<List<TripSummaryResponse>>> trips(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(ApiResponse.ok("Trips fetched",
                dashboardService.getTrips(Math.min(limit, 200))));
    }
}
