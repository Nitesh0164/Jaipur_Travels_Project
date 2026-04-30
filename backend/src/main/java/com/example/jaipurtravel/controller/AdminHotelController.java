package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.request.HotelCreateRequest;
import com.example.jaipurtravel.dto.request.HotelUpdateRequest;
import com.example.jaipurtravel.dto.response.HotelResponse;
import com.example.jaipurtravel.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/hotels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Hotels", description = "Admin hotel management and MakCorps sync")
public class AdminHotelController {

    private final HotelService hotelService;

    @PostMapping
    @Operation(summary = "Create a hotel manually")
    public ResponseEntity<ApiResponse<HotelResponse>> create(@Valid @RequestBody HotelCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Hotel created", hotelService.createHotel(req)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update hotel details")
    public ResponseEntity<ApiResponse<HotelResponse>> update(
            @PathVariable Long id,
            @RequestBody HotelUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Hotel updated", hotelService.updateHotel(id, req)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a hotel")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok(ApiResponse.ok("Hotel deleted"));
    }

    @PostMapping("/sync-makcorps")
    @Operation(summary = "Sync hotels from MakCorps API (requires MAKCORPS_JAIPUR_CITY_ID)")
    public ResponseEntity<ApiResponse<String>> syncMakCorps() {
        String result = hotelService.syncFromMakCorps();
        return ResponseEntity.ok(ApiResponse.ok(result, result));
    }
}
