package com.example.jaipurtravel.service;

import com.example.jaipurtravel.dto.request.LoginRequest;
import com.example.jaipurtravel.dto.request.RefreshTokenRequest;
import com.example.jaipurtravel.dto.request.SignupRequest;
import com.example.jaipurtravel.dto.response.AuthResponse;
import com.example.jaipurtravel.dto.response.UserResponse;

public interface AuthService {

    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(RefreshTokenRequest request);

    UserResponse getCurrentUser(String email);
}
