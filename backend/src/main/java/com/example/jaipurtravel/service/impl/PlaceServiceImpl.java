package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.request.CreatePlaceRequest;
import com.example.jaipurtravel.dto.request.UpdatePlaceRequest;
import com.example.jaipurtravel.dto.response.PlaceFilterResponse;
import com.example.jaipurtravel.dto.response.PlaceResponse;
import com.example.jaipurtravel.entity.Place;
import com.example.jaipurtravel.entity.PlaceTag;
import com.example.jaipurtravel.exception.DuplicateResourceException;
import com.example.jaipurtravel.exception.ResourceNotFoundException;
import com.example.jaipurtravel.repository.PlaceRepository;
import com.example.jaipurtravel.service.PlaceService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceServiceImpl implements PlaceService {

    private final PlaceRepository placeRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> getAllPlaces() {
        return placeRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PlaceResponse getPlaceByIdOrSlug(String idOrSlug) {
        Place place;
        try {
            Long id = Long.parseLong(idOrSlug);
            place = placeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Place", "id", id));
        } catch (NumberFormatException e) {
            place = placeRepository.findBySlug(idOrSlug)
                    .orElseThrow(() -> new ResourceNotFoundException("Place", "slug", idOrSlug));
        }
        return toResponse(place);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> search(String query) {
        if (query == null || query.trim().isEmpty()) return getAllPlaces();
        return placeRepository.search(query.trim()).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> getByCategory(String category) {
        return placeRepository.findByCategoryIgnoreCase(category).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> getByArea(String area) {
        return placeRepository.findByAreaContainingIgnoreCase(area).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> getByTag(String tag) {
        return placeRepository.findByTag(tag).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> getFeatured() {
        return placeRepository.findFeaturedByCity("jaipur").stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> getSimilar(String idOrSlug) {
        PlaceResponse place = getPlaceByIdOrSlug(idOrSlug);
        return placeRepository.findSimilar(place.getCategory(), place.getId())
                .stream().map(this::toResponse).limit(5).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PlaceFilterResponse getFilterOptions() {
        return PlaceFilterResponse.builder()
                .categories(placeRepository.findDistinctCategories())
                .areas(placeRepository.findDistinctAreas())
                .tags(placeRepository.findDistinctTags())
                .build();
    }

    @Override
    @Transactional
    public PlaceResponse createPlace(CreatePlaceRequest req) {
        String slug = generateSlug(req.getName());
        if (placeRepository.findBySlug(slug).isPresent()) {
            throw new DuplicateResourceException("A place with slug '" + slug + "' already exists");
        }

        Place place = Place.builder()
                .slug(slug)
                .name(req.getName().trim())
                .category(req.getCategory())
                .area(req.getArea())
                .tagline(req.getTagline())
                .shortDesc(req.getShortDesc())
                .overview(req.getOverview())
                .entryFee(req.getEntryFee())
                .estimatedSpend(req.getEstimatedSpend())
                .duration(req.getDuration())
                .bestTime(req.getBestTime())
                .openHours(req.getOpenHours())
                .rating(req.getRating())
                .reviewCount(req.getReviewCount() != null ? req.getReviewCount() : 0)
                .mustSee(req.getMustSee() != null ? req.getMustSee() : false)
                .image(req.getImage())
                .tip(req.getTip())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .city(req.getCity() != null ? req.getCity() : "jaipur")
                .nearbyJson(toJson(req.getNearby()))
                .nearbyFoodJson(toJson(req.getNearbyFood()))
                .bestWeatherJson(toJson(req.getBestWeather()))
                .bestTimeOfDayJson(toJson(req.getBestTimeOfDay()))
                .build();

        place.setTagsList(req.getTags());
        place = placeRepository.save(place);
        log.info("Place created: {} ({})", place.getName(), place.getSlug());
        return toResponse(place);
    }

    @Override
    @Transactional
    public PlaceResponse updatePlace(Long id, UpdatePlaceRequest req) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", id));

        if (req.getName() != null) { place.setName(req.getName().trim()); place.setSlug(generateSlug(req.getName())); }
        if (req.getCategory() != null) place.setCategory(req.getCategory());
        if (req.getArea() != null) place.setArea(req.getArea());
        if (req.getTagline() != null) place.setTagline(req.getTagline());
        if (req.getShortDesc() != null) place.setShortDesc(req.getShortDesc());
        if (req.getOverview() != null) place.setOverview(req.getOverview());
        if (req.getEntryFee() != null) place.setEntryFee(req.getEntryFee());
        if (req.getEstimatedSpend() != null) place.setEstimatedSpend(req.getEstimatedSpend());
        if (req.getDuration() != null) place.setDuration(req.getDuration());
        if (req.getBestTime() != null) place.setBestTime(req.getBestTime());
        if (req.getOpenHours() != null) place.setOpenHours(req.getOpenHours());
        if (req.getRating() != null) place.setRating(req.getRating());
        if (req.getReviewCount() != null) place.setReviewCount(req.getReviewCount());
        if (req.getMustSee() != null) place.setMustSee(req.getMustSee());
        if (req.getImage() != null) place.setImage(req.getImage());
        if (req.getTip() != null) place.setTip(req.getTip());
        if (req.getLatitude() != null) place.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) place.setLongitude(req.getLongitude());
        if (req.getCity() != null) place.setCity(req.getCity());
        if (req.getNearby() != null) place.setNearbyJson(toJson(req.getNearby()));
        if (req.getNearbyFood() != null) place.setNearbyFoodJson(toJson(req.getNearbyFood()));
        if (req.getBestWeather() != null) place.setBestWeatherJson(toJson(req.getBestWeather()));
        if (req.getBestTimeOfDay() != null) place.setBestTimeOfDayJson(toJson(req.getBestTimeOfDay()));
        if (req.getTags() != null) place.setTagsList(req.getTags());

        place = placeRepository.save(place);
        log.info("Place updated: {} (id={})", place.getName(), place.getId());
        return toResponse(place);
    }

    @Override
    @Transactional
    public void deletePlace(Long id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", id));
        placeRepository.delete(place);
        log.info("Place deleted: {} (id={})", place.getName(), id);
    }

    // --- Mapping helpers ---

    private PlaceResponse toResponse(Place p) {
        return PlaceResponse.builder()
                .id(p.getId())
                .slug(p.getSlug())
                .name(p.getName())
                .category(p.getCategory())
                .area(p.getArea())
                .tagline(p.getTagline())
                .shortDesc(p.getShortDesc())
                .overview(p.getOverview())
                .entryFee(p.getEntryFee())
                .estimatedSpend(p.getEstimatedSpend())
                .duration(p.getDuration())
                .bestTime(p.getBestTime())
                .openHours(p.getOpenHours())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .mustSee(p.getMustSee())
                .image(p.getImage())
                .tip(p.getTip())
                .tags(p.getTags().stream().map(PlaceTag::getTag).collect(Collectors.toList()))
                .nearby(fromJson(p.getNearbyJson()))
                .nearbyFood(fromJson(p.getNearbyFoodJson()))
                .bestWeather(fromJson(p.getBestWeatherJson()))
                .bestTimeOfDay(fromJson(p.getBestTimeOfDayJson()))
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .city(p.getCity())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .build();
    }

    private String generateSlug(String name) {
        return name.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
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
