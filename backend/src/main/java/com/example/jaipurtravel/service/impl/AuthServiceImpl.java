package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.request.LoginRequest;
import com.example.jaipurtravel.dto.request.RefreshTokenRequest;
import com.example.jaipurtravel.dto.request.SignupRequest;
import com.example.jaipurtravel.dto.response.AuthResponse;
import com.example.jaipurtravel.dto.response.UserResponse;
import com.example.jaipurtravel.entity.RefreshToken;
import com.example.jaipurtravel.entity.Role;
import com.example.jaipurtravel.entity.User;
import com.example.jaipurtravel.exception.BadRequestException;
import com.example.jaipurtravel.exception.DuplicateResourceException;
import com.example.jaipurtravel.exception.ResourceNotFoundException;
import com.example.jaipurtravel.exception.TokenException;
import com.example.jaipurtravel.repository.RefreshTokenRepository;
import com.example.jaipurtravel.repository.UserRepository;
import com.example.jaipurtravel.security.JwtService;
import com.example.jaipurtravel.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {} ({})", user.getEmail(), user.getRole());

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Spring Security authentication — throws BadCredentialsException on failure
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        // Validate JWT signature/expiry
        if (!jwtService.validateRefreshToken(token)) {
            throw new TokenException("Invalid or expired refresh token");
        }

        // Find in database and check not revoked
        RefreshToken storedToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenException("Refresh token not found"));

        if (!storedToken.isUsable()) {
            throw new TokenException("Refresh token has been revoked or expired");
        }

        // Revoke old token (rotation)
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        User user = storedToken.getUser();
        log.info("Token refreshed for: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        RefreshToken storedToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenException("Refresh token not found"));

        // Revoke all tokens for this user
        refreshTokenRepository.revokeAllByUser(storedToken.getUser());
        log.info("User logged out: {}", storedToken.getUser().getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return toUserResponse(user);
    }

    // --- Private helpers ---

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(
                user.getEmail(), user.getId(), user.getRole().name());

        String refreshTokenStr = jwtService.generateRefreshToken(user.getEmail());

        // Persist refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiryDate(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
