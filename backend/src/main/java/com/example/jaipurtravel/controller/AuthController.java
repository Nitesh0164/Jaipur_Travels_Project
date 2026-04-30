package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.request.LoginRequest;
import com.example.jaipurtravel.dto.request.RefreshTokenRequest;
import com.example.jaipurtravel.dto.request.SignupRequest;
import com.example.jaipurtravel.dto.response.AuthResponse;
import com.example.jaipurtravel.dto.response.UserResponse;
import com.example.jaipurtravel.service.AnalyticsService;
import com.example.jaipurtravel.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Signup, login, refresh, logout, and current user endpoints")
public class AuthController {

    private final AuthService authService;
    private final AnalyticsService analyticsService;

    @PostMapping("/signup")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(
            @Valid @RequestBody SignupRequest request) {

        AuthResponse data = authService.signup(request);
        analyticsService.logEvent("SIGNUP", request.getEmail());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Account created successfully", data));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse data = authService.login(request);
            analyticsService.logEvent("LOGIN_SUCCESS", request.getEmail());
            return ResponseEntity.ok(ApiResponse.ok("Login successful", data));
        } catch (Exception e) {
            analyticsService.logEvent("LOGIN_FAILURE", request.getEmail());
            throw e;
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Get new access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {

        AuthResponse data = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed", data));
    }

    @PostMapping("/logout")
    @Operation(summary = "Invalidate refresh token and log out")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshTokenRequest request) {

        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        UserResponse data = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.ok("User retrieved", data));
    }
}
