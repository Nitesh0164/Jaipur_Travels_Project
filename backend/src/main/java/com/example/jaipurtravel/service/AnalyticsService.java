package com.example.jaipurtravel.service;

import com.example.jaipurtravel.entity.AnalyticsEvent;
import com.example.jaipurtravel.entity.User;
import com.example.jaipurtravel.repository.AnalyticsEventRepository;
import com.example.jaipurtravel.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Lightweight analytics logger — inject into controllers to track events.
 * Uses @Async so it never slows down the main request.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AnalyticsEventRepository eventRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;

    @Async
    public void logEvent(String eventType, String email, String queryText, Map<String, Object> meta) {
        try {
            User user = null;
            if (email != null) {
                user = userRepo.findByEmail(email).orElse(null);
            }
            AnalyticsEvent event = AnalyticsEvent.builder()
                    .user(user)
                    .eventType(eventType)
                    .queryText(queryText != null && queryText.length() > 500 ? queryText.substring(0, 500) : queryText)
                    .metaJson(meta != null ? objectMapper.writeValueAsString(meta) : null)
                    .build();
            eventRepo.save(event);
        } catch (Exception e) {
            log.warn("Failed to log analytics event: {}", e.getMessage());
        }
    }

    /** Convenience — no query text or meta. */
    public void logEvent(String eventType, String email) {
        logEvent(eventType, email, null, null);
    }

    /** Convenience — with query text, no meta. */
    public void logEvent(String eventType, String email, String queryText) {
        logEvent(eventType, email, queryText, null);
    }
}
