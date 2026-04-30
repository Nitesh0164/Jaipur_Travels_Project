package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.response.PlaceFilterResponse;
import com.example.jaipurtravel.dto.response.PlaceResponse;
import com.example.jaipurtravel.service.AnalyticsService;
import com.example.jaipurtravel.service.PlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
@Tag(name = "Places", description = "Public place browsing, search, and filter endpoints")
public class PlaceController {

    private final PlaceService placeService;
    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "List all places")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Places fetched", placeService.getAllPlaces()));
    }

    @GetMapping("/{idOrSlug}")
    @Operation(summary = "Get place by ID or slug")
    public ResponseEntity<ApiResponse<PlaceResponse>> getOne(@PathVariable String idOrSlug) {
        return ResponseEntity.ok(ApiResponse.ok("Place fetched", placeService.getPlaceByIdOrSlug(idOrSlug)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search places by keyword")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> search(@RequestParam String q) {
        analyticsService.logEvent("PLACE_SEARCH", null, q);
        return ResponseEntity.ok(ApiResponse.ok("Search results", placeService.search(q)));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get available filter options (categories, areas, tags)")
    public ResponseEntity<ApiResponse<PlaceFilterResponse>> filters() {
        return ResponseEntity.ok(ApiResponse.ok("Filter options", placeService.getFilterOptions()));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured / must-see places")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> featured() {
        return ResponseEntity.ok(ApiResponse.ok("Featured places", placeService.getFeatured()));
    }

    @GetMapping("/by-category/{category}")
    @Operation(summary = "Get places by category")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> byCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.ok("Places by category", placeService.getByCategory(category)));
    }

    @GetMapping("/by-area/{area}")
    @Operation(summary = "Get places by area")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> byArea(@PathVariable String area) {
        return ResponseEntity.ok(ApiResponse.ok("Places by area", placeService.getByArea(area)));
    }

    @GetMapping("/by-tag/{tag}")
    @Operation(summary = "Get places by tag")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> byTag(@PathVariable String tag) {
        return ResponseEntity.ok(ApiResponse.ok("Places by tag", placeService.getByTag(tag)));
    }

    @GetMapping("/{idOrSlug}/similar")
    @Operation(summary = "Get similar places in the same category")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> similar(@PathVariable String idOrSlug) {
        return ResponseEntity.ok(ApiResponse.ok("Similar places", placeService.getSimilar(idOrSlug)));
    }
}
