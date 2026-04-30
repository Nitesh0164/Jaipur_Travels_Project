package com.example.jaipurtravel.service;

import com.example.jaipurtravel.dto.request.CreateBusRouteRequest;
import com.example.jaipurtravel.dto.request.RoutePlanRequest;
import com.example.jaipurtravel.dto.request.UpdateBusRouteRequest;
import com.example.jaipurtravel.dto.response.BusRouteResponse;
import com.example.jaipurtravel.dto.response.RoutePlanResponse;

import java.util.List;

public interface BusService {

    List<BusRouteResponse> getAllRoutes();
    BusRouteResponse getRouteById(Long id);
    List<BusRouteResponse> searchByRouteNo(String routeNo);
    List<String> suggestStops(String query);
    RoutePlanResponse planRoute(RoutePlanRequest request);

    // Admin
    BusRouteResponse createRoute(CreateBusRouteRequest request);
    BusRouteResponse updateRoute(Long id, UpdateBusRouteRequest request);
    void deleteRoute(Long id);
}
