package com.example.jaipurtravel.service;

import com.example.jaipurtravel.entity.AdminLog;
import com.example.jaipurtravel.entity.User;
import com.example.jaipurtravel.repository.AdminLogRepository;
import com.example.jaipurtravel.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Logs admin mutation actions (create/update/delete) for audit trail.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminLogService {

    private final AdminLogRepository logRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;

    @Async
    public void log(String adminEmail, String action, String entityType, Long entityId, Map<String, Object> meta) {
        try {
            User admin = userRepo.findByEmail(adminEmail).orElse(null);
            if (admin == null) { log.warn("Admin not found: {}", adminEmail); return; }

            AdminLog entry = AdminLog.builder()
                    .admin(admin)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .metaJson(meta != null ? objectMapper.writeValueAsString(meta) : null)
                    .build();
            logRepo.save(entry);
            log.info("Admin log: {} {} {} #{}", adminEmail, action, entityType, entityId);
        } catch (Exception e) {
            log.warn("Failed to log admin action: {}", e.getMessage());
        }
    }

    public void log(String adminEmail, String action, String entityType, Long entityId) {
        log(adminEmail, action, entityType, entityId, null);
    }
}
