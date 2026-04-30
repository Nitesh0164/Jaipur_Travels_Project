package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.request.RoutePlanRequest;
import com.example.jaipurtravel.dto.response.BusRouteResponse;
import com.example.jaipurtravel.dto.response.RoutePlanResponse;
import com.example.jaipurtravel.service.BusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buses")
@RequiredArgsConstructor
@Tag(name = "Bus Routes", description = "Public bus route browsing, search, and route planning")
public class BusController {

    private final BusService busService;

    @GetMapping("/routes")
    @Operation(summary = "List all bus routes")
    public ResponseEntity<ApiResponse<List<BusRouteResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Routes fetched", busService.getAllRoutes()));
    }

    @GetMapping("/routes/{id}")
    @Operation(summary = "Get bus route by ID")
    public ResponseEntity<ApiResponse<BusRouteResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Route fetched", busService.getRouteById(id)));
    }

    @GetMapping("/routes/search")
    @Operation(summary = "Search routes by route number")
    public ResponseEntity<ApiResponse<List<BusRouteResponse>>> search(@RequestParam String routeNo) {
        return ResponseEntity.ok(ApiResponse.ok("Search results", busService.searchByRouteNo(routeNo)));
    }

    @GetMapping("/stops/suggest")
    @Operation(summary = "Autocomplete stop names")
    public ResponseEntity<ApiResponse<List<String>>> suggestStops(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok("Stop suggestions", busService.suggestStops(q)));
    }

    @PostMapping("/plan-route")
    @Operation(summary = "Plan a route between two stops (direct + one-change)")
    public ResponseEntity<ApiResponse<RoutePlanResponse>> planRoute(@Valid @RequestBody RoutePlanRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Route plan", busService.planRoute(req)));
    }
}
