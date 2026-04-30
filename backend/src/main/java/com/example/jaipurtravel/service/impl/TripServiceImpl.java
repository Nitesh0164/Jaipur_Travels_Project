package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.request.CreateTripRequest;
import com.example.jaipurtravel.dto.request.UpdateTripRequest;
import com.example.jaipurtravel.dto.response.TripResponse;
import com.example.jaipurtravel.dto.response.TripSummaryResponse;
import com.example.jaipurtravel.entity.Trip;
import com.example.jaipurtravel.entity.User;
import com.example.jaipurtravel.exception.ResourceNotFoundException;
import com.example.jaipurtravel.repository.TripRepository;
import com.example.jaipurtravel.repository.UserRepository;
import com.example.jaipurtravel.service.TripService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TripSummaryResponse> getTripsForUser(String email) {
        User user = findUser(email);
        return tripRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTripById(Long id, String email) {
        User user = findUser(email);
        Trip trip = tripRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", id));
        return toResponse(trip);
    }

    @Override
    @Transactional
    public TripResponse createTrip(CreateTripRequest req, String email) {
        User user = findUser(email);

        Trip trip = Trip.builder()
                .user(user)
                .title(req.getTitle().trim())
                .city(req.getCity() != null ? req.getCity().trim().toLowerCase() : "jaipur")
                .days(req.getDays())
                .budget(req.getBudget())
                .travelStyle(req.getTravelStyle())
                .groupType(req.getGroupType())
                .interestsJson(toJson(req.getInterests()))
                .summary(req.getSummary())
                .totalCost(req.getTotalCost() != null ? req.getTotalCost() : BigDecimal.ZERO)
                .itineraryJson(req.getItineraryJson())
                .notes(req.getNotes())
                .build();

        trip = tripRepository.save(trip);
        log.info("Trip created: '{}' (id={}) by user {}", trip.getTitle(), trip.getId(), email);
        return toResponse(trip);
    }

    @Override
    @Transactional
    public TripResponse updateTrip(Long id, UpdateTripRequest req, String email) {
        User user = findUser(email);
        Trip trip = tripRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", id));

        if (req.getTitle() != null) trip.setTitle(req.getTitle().trim());
        if (req.getSummary() != null) trip.setSummary(req.getSummary());
        if (req.getNotes() != null) trip.setNotes(req.getNotes());
        if (req.getItineraryJson() != null) trip.setItineraryJson(req.getItineraryJson());

        trip = tripRepository.save(trip);
        log.info("Trip updated: '{}' (id={}) by user {}", trip.getTitle(), trip.getId(), email);
        return toResponse(trip);
    }

    @Override
    @Transactional
    public void deleteTrip(Long id, String email) {
        User user = findUser(email);
        Trip trip = tripRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", id));
        tripRepository.delete(trip);
        log.info("Trip deleted: id={} by user {}", id, email);
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private TripResponse toResponse(Trip t) {
        return TripResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .city(t.getCity())
                .days(t.getDays())
                .budget(t.getBudget())
                .travelStyle(t.getTravelStyle())
                .groupType(t.getGroupType())
                .interests(fromJson(t.getInterestsJson()))
                .summary(t.getSummary())
                .totalCost(t.getTotalCost())
                .itineraryJson(t.getItineraryJson())
                .notes(t.getNotes())
                .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null)
                .updatedAt(t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : null)
                .build();
    }

    private TripSummaryResponse toSummary(Trip t) {
        return TripSummaryResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .city(t.getCity())
                .days(t.getDays())
                .travelStyle(t.getTravelStyle())
                .totalCost(t.getTotalCost())
                .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null)
                .build();
    }

    private String toJson(List<String> list) {
        if (list == null) return null;
        try { return objectMapper.writeValueAsString(list); }
        catch (JsonProcessingException e) { return "[]"; }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try { return objectMapper.readValue(json, new TypeReference<>() {}); }
        catch (JsonProcessingException e) { return Collections.emptyList(); }
    }
}
