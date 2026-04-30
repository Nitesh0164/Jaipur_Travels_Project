package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.request.CreateBusRouteRequest;
import com.example.jaipurtravel.dto.request.UpdateBusRouteRequest;
import com.example.jaipurtravel.dto.response.BusRouteResponse;
import com.example.jaipurtravel.service.AdminLogService;
import com.example.jaipurtravel.service.BusService;
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
@RequestMapping("/api/admin/buses/routes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Bus Routes", description = "ADMIN-only bus route management")
public class AdminBusController {

    private final BusService busService;
    private final AdminLogService adminLogService;

    @PostMapping
    @Operation(summary = "Create a new bus route")
    public ResponseEntity<ApiResponse<BusRouteResponse>> create(
            @Valid @RequestBody CreateBusRouteRequest req, Authentication auth) {
        BusRouteResponse data = busService.createRoute(req);
        adminLogService.log(extractEmail(auth), "CREATE", "BUS_ROUTE", data.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Bus route created", data));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a bus route")
    public ResponseEntity<ApiResponse<BusRouteResponse>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateBusRouteRequest req, Authentication auth) {
        BusRouteResponse data = busService.updateRoute(id, req);
        adminLogService.log(extractEmail(auth), "UPDATE", "BUS_ROUTE", id);
        return ResponseEntity.ok(ApiResponse.ok("Bus route updated", data));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a bus route")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication auth) {
        busService.deleteRoute(id);
        adminLogService.log(extractEmail(auth), "DELETE", "BUS_ROUTE", id);
        return ResponseEntity.ok(ApiResponse.ok("Bus route deleted"));
    }

    private String extractEmail(Authentication auth) {
        return ((UserDetails) auth.getPrincipal()).getUsername();
    }
}
