package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.request.CreatePlaceRequest;
import com.example.jaipurtravel.dto.request.UpdatePlaceRequest;
import com.example.jaipurtravel.dto.response.PlaceResponse;
import com.example.jaipurtravel.service.AdminLogService;
import com.example.jaipurtravel.service.PlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/places")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Places", description = "ADMIN-only place management endpoints")
public class AdminPlaceController {

    private final PlaceService placeService;
    private final AdminLogService adminLogService;

    @PostMapping
    @Operation(summary = "Create a new place")
    public ResponseEntity<ApiResponse<PlaceResponse>> create(
            @Valid @RequestBody CreatePlaceRequest req, Authentication auth) {
        PlaceResponse data = placeService.createPlace(req);
        adminLogService.log(extractEmail(auth), "CREATE", "PLACE", data.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Place created", data));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing place")
    public ResponseEntity<ApiResponse<PlaceResponse>> update(
            @PathVariable Long id, @Valid @RequestBody UpdatePlaceRequest req, Authentication auth) {
        PlaceResponse data = placeService.updatePlace(id, req);
        adminLogService.log(extractEmail(auth), "UPDATE", "PLACE", id);
        return ResponseEntity.ok(ApiResponse.ok("Place updated", data));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a place")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication auth) {
        placeService.deletePlace(id);
        adminLogService.log(extractEmail(auth), "DELETE", "PLACE", id);
        return ResponseEntity.ok(ApiResponse.ok("Place deleted"));
    }

    private String extractEmail(Authentication auth) {
        return ((UserDetails) auth.getPrincipal()).getUsername();
    }
}
