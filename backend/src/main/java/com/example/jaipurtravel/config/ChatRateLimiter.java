package com.example.jaipurtravel.config;

import com.example.jaipurtravel.common.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple sliding-window rate limiter for the chat endpoint.
 * User-based (via JWT email in header) with IP fallback.
 */
@Slf4j
@Component
public class ChatRateLimiter implements Filter {

    private final int windowSeconds;
    private final int maxRequests;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    public ChatRateLimiter(
            @Value("${app.chat.rate-limit.window-seconds:60}") int windowSeconds,
            @Value("${app.chat.rate-limit.max-requests:10}") int maxRequests) {
        this.windowSeconds = windowSeconds;
        this.maxRequests = maxRequests;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpReq = (HttpServletRequest) req;
        HttpServletResponse httpRes = (HttpServletResponse) res;

        // Only rate-limit POST /api/chat/message
        if (!"POST".equalsIgnoreCase(httpReq.getMethod())
                || !httpReq.getRequestURI().equals("/api/chat/message")) {
            chain.doFilter(req, res);
            return;
        }

        String key = resolveKey(httpReq);
        WindowCounter counter = counters.computeIfAbsent(key, k -> new WindowCounter());

        if (counter.isAllowed(windowSeconds, maxRequests)) {
            chain.doFilter(req, res);
        } else {
            log.warn("Rate limit exceeded for key: {}", key);
            httpRes.setStatus(429);
            httpRes.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(httpRes.getOutputStream(),
                    ApiResponse.error("Too many requests — please wait before sending another message"));
        }
    }

    private String resolveKey(HttpServletRequest req) {
        // Use Authorization header email if available
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return "user:" + auth.hashCode(); // cheap key from token
        }
        return "ip:" + req.getRemoteAddr();
    }

    private static class WindowCounter {
        private long windowStart;
        private final AtomicInteger count = new AtomicInteger(0);

        synchronized boolean isAllowed(int windowSeconds, int max) {
            long now = System.currentTimeMillis();
            long windowMs = windowSeconds * 1000L;
            if (now - windowStart > windowMs) {
                windowStart = now;
                count.set(1);
                return true;
            }
            return count.incrementAndGet() <= max;
        }
    }
}
