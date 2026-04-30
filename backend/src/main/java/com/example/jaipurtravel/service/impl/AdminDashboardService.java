package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.response.*;
import com.example.jaipurtravel.dto.response.AdminDashboardResponse.*;
import com.example.jaipurtravel.dto.response.AnalyticsOverviewResponse.QueryCount;
import com.example.jaipurtravel.entity.*;
import com.example.jaipurtravel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepo;
    private final PlaceRepository placeRepo;
    private final BusRouteRepository busRouteRepo;
    private final TripRepository tripRepo;
    private final ChatSessionRepository chatSessionRepo;
    private final ChatMessageRepository chatMessageRepo;
    private final AnalyticsEventRepository analyticsRepo;
    private final AdminLogRepository adminLogRepo;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        Overview overview = Overview.builder()
                .totalUsers(userRepo.count())
                .totalPlaces(placeRepo.count())
                .totalBusRoutes(busRouteRepo.count())
                .totalTrips(tripRepo.count())
                .totalChatSessions(chatSessionRepo.count())
                .totalChatMessages(chatMessageRepo.count())
                .totalAnalyticsEvents(analyticsRepo.count())
                .build();

        // Recent users (last 10)
        List<AdminUserResponse> recentUsers = userRepo.findAll(PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("createdAt").descending()))
                .stream().map(this::toUserResponse).collect(Collectors.toList());

        // Recent trips (last 10)
        List<TripSummaryResponse> recentTrips = tripRepo.findAll(PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("createdAt").descending()))
                .stream().map(this::toTripSummary).collect(Collectors.toList());

        // Top event types
        List<EventCount> topEvents = analyticsRepo.countByEventType().stream()
                .limit(10)
                .map(row -> EventCount.builder()
                        .eventType((String) row[0])
                        .count((Long) row[1]).build())
                .collect(Collectors.toList());

        // Counts by place category and area
        Map<String, Long> byCategory = new LinkedHashMap<>();
        placeRepo.findDistinctCategories().forEach(cat ->
                byCategory.put(cat, (long) placeRepo.findByCategoryIgnoreCase(cat).size()));
        Map<String, Long> byArea = new LinkedHashMap<>();
        placeRepo.findDistinctAreas().forEach(area ->
                byArea.put(area, (long) placeRepo.findByAreaContainingIgnoreCase(area).size()));

        return AdminDashboardResponse.builder()
                .overview(overview)
                .recentUsers(recentUsers)
                .recentTrips(recentTrips)
                .topEventTypes(topEvents)
                .countsByPlaceCategory(byCategory)
                .countsByArea(byArea)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsOverviewResponse getAnalyticsOverview() {
        long total = analyticsRepo.count();

        List<EventCount> counts = analyticsRepo.countByEventType().stream()
                .map(row -> EventCount.builder().eventType((String) row[0]).count((Long) row[1]).build())
                .collect(Collectors.toList());

        List<AnalyticsEventResponse> recent = analyticsRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 20))
                .stream().map(this::toEventResponse).collect(Collectors.toList());

        List<QueryCount> popular = analyticsRepo.topQueries(PageRequest.of(0, 10)).stream()
                .map(row -> QueryCount.builder().query((String) row[0]).count((Long) row[1]).build())
                .collect(Collectors.toList());

        return AnalyticsOverviewResponse.builder()
                .totalEvents(total).countsByEventType(counts)
                .recentEvents(recent).popularQueries(popular).build();
    }

    @Transactional(readOnly = true)
    public List<AnalyticsEventResponse> getRecentEvents(String eventType, int limit) {
        PageRequest page = PageRequest.of(0, limit);
        List<AnalyticsEvent> events = eventType != null && !eventType.isBlank()
                ? analyticsRepo.findByEventTypeOrderByCreatedAtDesc(eventType, page)
                : analyticsRepo.findAllByOrderByCreatedAtDesc(page);
        return events.stream().map(this::toEventResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminLogResponse> getAdminLogs(int limit) {
        return adminLogRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit))
                .stream().map(this::toLogResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {
        return userRepo.findAll(org.springframework.data.domain.Sort.by("createdAt").descending())
                .stream().map(this::toUserResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TripSummaryResponse> getTrips(int limit) {
        return tripRepo.findAll(PageRequest.of(0, limit, org.springframework.data.domain.Sort.by("createdAt").descending()))
                .stream().map(this::toTripSummary).collect(Collectors.toList());
    }

    // ── Mappers ─────────────────────────────────────────────────────

    private AdminUserResponse toUserResponse(User u) {
        return AdminUserResponse.builder()
                .id(u.getId()).name(u.getName()).email(u.getEmail())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null).build();
    }

    private TripSummaryResponse toTripSummary(Trip t) {
        return TripSummaryResponse.builder()
                .id(t.getId()).title(t.getTitle()).city(t.getCity())
                .days(t.getDays()).travelStyle(t.getTravelStyle())
                .totalCost(t.getTotalCost())
                .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null).build();
    }

    private AnalyticsEventResponse toEventResponse(AnalyticsEvent e) {
        return AnalyticsEventResponse.builder()
                .id(e.getId()).eventType(e.getEventType()).queryText(e.getQueryText())
                .userName(e.getUser() != null ? e.getUser().getName() : "anonymous")
                .metaJson(e.getMetaJson())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null).build();
    }

    private AdminLogResponse toLogResponse(AdminLog l) {
        return AdminLogResponse.builder()
                .id(l.getId())
                .adminName(l.getAdmin() != null ? l.getAdmin().getName() : "unknown")
                .adminEmail(l.getAdmin() != null ? l.getAdmin().getEmail() : "unknown")
                .action(l.getAction()).entityType(l.getEntityType()).entityId(l.getEntityId())
                .metaJson(l.getMetaJson())
                .createdAt(l.getCreatedAt() != null ? l.getCreatedAt().toString() : null).build();
    }
}
