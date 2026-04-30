package com.example.jaipurtravel.service;

import com.example.jaipurtravel.dto.request.CreatePlaceRequest;
import com.example.jaipurtravel.dto.request.UpdatePlaceRequest;
import com.example.jaipurtravel.dto.response.PlaceFilterResponse;
import com.example.jaipurtravel.dto.response.PlaceResponse;

import java.util.List;

public interface PlaceService {

    List<PlaceResponse> getAllPlaces();
    PlaceResponse getPlaceByIdOrSlug(String idOrSlug);
    List<PlaceResponse> search(String query);
    List<PlaceResponse> getByCategory(String category);
    List<PlaceResponse> getByArea(String area);
    List<PlaceResponse> getByTag(String tag);
    List<PlaceResponse> getFeatured();
    List<PlaceResponse> getSimilar(String idOrSlug);
    PlaceFilterResponse getFilterOptions();

    // Admin
    PlaceResponse createPlace(CreatePlaceRequest request);
    PlaceResponse updatePlace(Long id, UpdatePlaceRequest request);
    void deletePlace(Long id);
}
