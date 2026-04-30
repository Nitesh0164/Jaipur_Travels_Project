package com.example.jaipurtravel.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Slf4j
@Service
public class JwtService {

    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${app.jwt.access-secret}") String accessSecret,
            @Value("${app.jwt.refresh-secret}") String refreshSecret,
            @Value("${app.jwt.access-expiration-ms}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs
    ) {
        this.accessKey = Keys.hmacShaKeyFor(padSecret(accessSecret));
        this.refreshKey = Keys.hmacShaKeyFor(padSecret(refreshSecret));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    // --- Access token ---

    public String generateAccessToken(String email, Long userId, String role) {
        return Jwts.builder()
                .subject(email)
                .claims(Map.of("userId", userId, "role", role))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpirationMs))
                .signWith(accessKey)
                .compact();
    }

    public String getEmailFromAccessToken(String token) {
        return parseClaims(token, accessKey).getSubject();
    }

    public boolean validateAccessToken(String token) {
        return validateToken(token, accessKey);
    }

    // --- Refresh token ---

    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(refreshKey)
                .compact();
    }

    public String getEmailFromRefreshToken(String token) {
        return parseClaims(token, refreshKey).getSubject();
    }

    public boolean validateRefreshToken(String token) {
        return validateToken(token, refreshKey);
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    // --- Internal helpers ---

    private boolean validateToken(String token, SecretKey key) {
        try {
            parseClaims(token, key);
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT expired: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.warn("Malformed JWT: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.warn("Unsupported JWT: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.warn("Empty JWT: {}", ex.getMessage());
        } catch (JwtException ex) {
            log.warn("JWT error: {}", ex.getMessage());
        }
        return false;
    }

    private Claims parseClaims(String token, SecretKey key) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Pads a short secret to at least 64 bytes for HMAC-SHA-512 compatibility. */
    private byte[] padSecret(String secret) {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length >= 64) return raw;
        byte[] padded = new byte[64];
        System.arraycopy(raw, 0, padded, 0, raw.length);
        return padded;
    }
}
