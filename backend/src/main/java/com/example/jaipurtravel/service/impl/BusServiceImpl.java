package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.request.CreateBusRouteRequest;
import com.example.jaipurtravel.dto.request.RoutePlanRequest;
import com.example.jaipurtravel.dto.request.UpdateBusRouteRequest;
import com.example.jaipurtravel.dto.response.BusRouteResponse;
import com.example.jaipurtravel.dto.response.BusStopResponse;
import com.example.jaipurtravel.dto.response.RoutePlanResponse;
import com.example.jaipurtravel.dto.response.RoutePlanResponse.DirectRouteResult;
import com.example.jaipurtravel.dto.response.RoutePlanResponse.OneChangeRouteResult;
import com.example.jaipurtravel.entity.BusRoute;
import com.example.jaipurtravel.entity.BusStop;
import com.example.jaipurtravel.exception.ResourceNotFoundException;
import com.example.jaipurtravel.repository.BusRouteRepository;
import com.example.jaipurtravel.repository.BusStopRepository;
import com.example.jaipurtravel.service.BusService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusServiceImpl implements BusService {

    private final BusRouteRepository busRouteRepository;
    private final BusStopRepository busStopRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BusRouteResponse> getAllRoutes() {
        return busRouteRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BusRouteResponse getRouteById(Long id) {
        BusRoute route = busRouteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BusRoute", "id", id));
        return toResponse(route);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusRouteResponse> searchByRouteNo(String routeNo) {
        return busRouteRepository.findByRouteNoIgnoreCase(routeNo.trim())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> suggestStops(String query) {
        if (query == null || query.trim().length() < 2) return Collections.emptyList();
        return busStopRepository.suggestStops(query.trim());
    }

    // ── Route planning engine ──────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public RoutePlanResponse planRoute(RoutePlanRequest request) {
        String src = normalize(request.getSource());
        String dst = normalize(request.getDestination());

        List<BusRoute> allRoutes = busRouteRepository.findAll();

        // 1. Find direct routes
        List<DirectRouteResult> directResults = findDirectRoutes(allRoutes, src, dst);

        // 2. If no direct routes, find one-change routes
        List<OneChangeRouteResult> oneChangeResults = new ArrayList<>();
        if (directResults.isEmpty()) {
            oneChangeResults = findOneChangeRoutes(allRoutes, src, dst);
        }

        String summary;
        if (!directResults.isEmpty()) {
            summary = directResults.size() + " direct route(s) found";
        } else if (!oneChangeResults.isEmpty()) {
            summary = "No direct route. " + oneChangeResults.size() + " option(s) with 1 change";
        } else {
            summary = "No routes found between these stops";
        }

        return RoutePlanResponse.builder()
                .source(request.getSource())
                .destination(request.getDestination())
                .directRoutes(directResults)
                .oneChangeRoutes(oneChangeResults)
                .summary(summary)
                .build();
    }

    private List<DirectRouteResult> findDirectRoutes(List<BusRoute> routes, String src, String dst) {
        List<DirectRouteResult> results = new ArrayList<>();

        for (BusRoute route : routes) {
            List<BusStop> stops = route.getStops();
            int srcIdx = findStopIndex(stops, src);
            int dstIdx = findStopIndex(stops, dst);

            if (srcIdx >= 0 && dstIdx >= 0 && srcIdx < dstIdx) {
                List<String> stopsOnWay = stops.subList(srcIdx, dstIdx + 1)
                        .stream().map(BusStop::getStopName).collect(Collectors.toList());

                results.add(DirectRouteResult.builder()
                        .routeId(route.getId())
                        .routeNo(route.getRouteNo())
                        .routeType(route.getRouteType())
                        .from(stops.get(srcIdx).getStopName())
                        .to(stops.get(dstIdx).getStopName())
                        .boardAtOrder(stops.get(srcIdx).getStopOrder())
                        .alightAtOrder(stops.get(dstIdx).getStopOrder())
                        .stopsToTravel(dstIdx - srcIdx)
                        .fareMin(route.getFareMin())
                        .fareMax(route.getFareMax())
                        .stopsOnWay(stopsOnWay)
                        .build());
            }
        }
        return results;
    }

    private List<OneChangeRouteResult> findOneChangeRoutes(List<BusRoute> routes, String src, String dst) {
        // Build index: which routes serve each stop
        Map<String, List<RouteStopInfo>> stopToRoutes = new HashMap<>();
        for (BusRoute route : routes) {
            for (BusStop stop : route.getStops()) {
                String norm = normalize(stop.getStopName());
                stopToRoutes.computeIfAbsent(norm, k -> new ArrayList<>())
                        .add(new RouteStopInfo(route, stop));
            }
        }

        // Find routes containing source and routes containing destination
        List<RouteStopInfo> srcRoutes = new ArrayList<>();
        List<RouteStopInfo> dstRoutes = new ArrayList<>();

        for (BusRoute route : routes) {
            int srcIdx = findStopIndex(route.getStops(), src);
            if (srcIdx >= 0) srcRoutes.add(new RouteStopInfo(route, route.getStops().get(srcIdx)));
            int dstIdx = findStopIndex(route.getStops(), dst);
            if (dstIdx >= 0) dstRoutes.add(new RouteStopInfo(route, route.getStops().get(dstIdx)));
        }

        List<OneChangeRouteResult> results = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (RouteStopInfo srcInfo : srcRoutes) {
            Set<String> routeAStops = srcInfo.route.getStops().stream()
                    .filter(s -> s.getStopOrder() > srcInfo.stop.getStopOrder())
                    .map(s -> normalize(s.getStopName()))
                    .collect(Collectors.toSet());

            for (RouteStopInfo dstInfo : dstRoutes) {
                if (srcInfo.route.getId().equals(dstInfo.route.getId())) continue;

                // Find common interchange stops
                for (BusStop bStop : dstInfo.route.getStops()) {
                    String interNorm = normalize(bStop.getStopName());
                    if (routeAStops.contains(interNorm) && bStop.getStopOrder() < dstInfo.stop.getStopOrder()) {
                        String key = srcInfo.route.getId() + "-" + interNorm + "-" + dstInfo.route.getId();
                        if (seen.contains(key)) continue;
                        seen.add(key);

                        // Build first leg: src → interchange on route A
                        int srcIdx = findStopIndex(srcInfo.route.getStops(), src);
                        int interIdxA = findStopIndex(srcInfo.route.getStops(), interNorm);
                        if (srcIdx < 0 || interIdxA < 0 || srcIdx >= interIdxA) continue;

                        DirectRouteResult leg1 = buildLeg(srcInfo.route, srcIdx, interIdxA);

                        // Build second leg: interchange → dst on route B
                        int interIdxB = findStopIndex(dstInfo.route.getStops(), interNorm);
                        int dstIdx = findStopIndex(dstInfo.route.getStops(), dst);
                        if (interIdxB < 0 || dstIdx < 0 || interIdxB >= dstIdx) continue;

                        DirectRouteResult leg2 = buildLeg(dstInfo.route, interIdxB, dstIdx);

                        results.add(OneChangeRouteResult.builder()
                                .firstLeg(leg1)
                                .secondLeg(leg2)
                                .interchangeStop(bStop.getStopName())
                                .totalStops(leg1.getStopsToTravel() + leg2.getStopsToTravel())
                                .estimatedFareMin(leg1.getFareMin().add(leg2.getFareMin()))
                                .estimatedFareMax(leg1.getFareMax().add(leg2.getFareMax()))
                                .build());

                        if (results.size() >= 5) return results;
                    }
                }
            }
        }

        // Sort by fewest total stops
        results.sort(Comparator.comparingInt(OneChangeRouteResult::getTotalStops));
        return results;
    }

    private DirectRouteResult buildLeg(BusRoute route, int fromIdx, int toIdx) {
        List<BusStop> stops = route.getStops();
        List<String> stopsOnWay = stops.subList(fromIdx, toIdx + 1)
                .stream().map(BusStop::getStopName).collect(Collectors.toList());

        return DirectRouteResult.builder()
                .routeId(route.getId())
                .routeNo(route.getRouteNo())
                .routeType(route.getRouteType())
                .from(stops.get(fromIdx).getStopName())
                .to(stops.get(toIdx).getStopName())
                .boardAtOrder(stops.get(fromIdx).getStopOrder())
                .alightAtOrder(stops.get(toIdx).getStopOrder())
                .stopsToTravel(toIdx - fromIdx)
                .fareMin(route.getFareMin())
                .fareMax(route.getFareMax())
                .stopsOnWay(stopsOnWay)
                .build();
    }

    /** Case-insensitive, fuzzy stop matching. */
    private int findStopIndex(List<BusStop> stops, String query) {
        String norm = normalize(query);
        // Exact match first
        for (int i = 0; i < stops.size(); i++) {
            if (normalize(stops.get(i).getStopName()).equals(norm)) return i;
        }
        // Partial/contains match
        for (int i = 0; i < stops.size(); i++) {
            String sn = normalize(stops.get(i).getStopName());
            if (sn.contains(norm) || norm.contains(sn)) return i;
        }
        return -1;
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().toLowerCase()
                .replaceAll("[^a-z0-9 ]", "")
                .replaceAll("\\s+", " ");
    }

    private record RouteStopInfo(BusRoute route, BusStop stop) {}

    // ── Admin CRUD ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public BusRouteResponse createRoute(CreateBusRouteRequest req) {
        BusRoute route = BusRoute.builder()
                .routeNo(req.getRouteNo().trim())
                .routeType(req.getRouteType() != null ? req.getRouteType() : "Regular")
                .category(req.getCategory() != null ? req.getCategory() : "Urban")
                .fromStop(req.getFromStop().trim())
                .toStop(req.getToStop().trim())
                .viaSummaryJson(toJson(req.getViaSummary()))
                .distanceKm(req.getDistanceKm())
                .stopsCount(req.getStopsCount())
                .headwayMinutes(req.getHeadwayMinutes())
                .busesOnRoute(req.getBusesOnRoute())
                .fareMin(req.getFareMin())
                .fareMax(req.getFareMax())
                .build();

        if (req.getStops() != null && !req.getStops().isEmpty()) {
            route.setStopsList(req.getStops());
        }

        route = busRouteRepository.save(route);
        log.info("Bus route created: {} (id={})", route.getRouteNo(), route.getId());
        return toResponse(route);
    }

    @Override
    @Transactional
    public BusRouteResponse updateRoute(Long id, UpdateBusRouteRequest req) {
        BusRoute route = busRouteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BusRoute", "id", id));

        if (req.getRouteNo() != null) route.setRouteNo(req.getRouteNo().trim());
        if (req.getRouteType() != null) route.setRouteType(req.getRouteType());
        if (req.getCategory() != null) route.setCategory(req.getCategory());
        if (req.getFromStop() != null) route.setFromStop(req.getFromStop().trim());
        if (req.getToStop() != null) route.setToStop(req.getToStop().trim());
        if (req.getViaSummary() != null) route.setViaSummaryJson(toJson(req.getViaSummary()));
        if (req.getDistanceKm() != null) route.setDistanceKm(req.getDistanceKm());
        if (req.getStopsCount() != null) route.setStopsCount(req.getStopsCount());
        if (req.getHeadwayMinutes() != null) route.setHeadwayMinutes(req.getHeadwayMinutes());
        if (req.getBusesOnRoute() != null) route.setBusesOnRoute(req.getBusesOnRoute());
        if (req.getFareMin() != null) route.setFareMin(req.getFareMin());
        if (req.getFareMax() != null) route.setFareMax(req.getFareMax());
        if (req.getStops() != null) route.setStopsList(req.getStops());

        route = busRouteRepository.save(route);
        log.info("Bus route updated: {} (id={})", route.getRouteNo(), id);
        return toResponse(route);
    }

    @Override
    @Transactional
    public void deleteRoute(Long id) {
        BusRoute route = busRouteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BusRoute", "id", id));
        busRouteRepository.delete(route);
        log.info("Bus route deleted: {} (id={})", route.getRouteNo(), id);
    }

    // ── Mapping ─────────────────────────────────────────────────────────

    private BusRouteResponse toResponse(BusRoute r) {
        List<BusStopResponse> stopResponses = r.getStops().stream()
                .map(s -> BusStopResponse.builder()
                        .id(s.getId()).stopName(s.getStopName()).stopOrder(s.getStopOrder()).build())
                .collect(Collectors.toList());

        // pathPreview = condensed stop list for display
        List<String> pathPreview = new ArrayList<>();
        if (!stopResponses.isEmpty()) {
            pathPreview.add(stopResponses.get(0).getStopName());
            int step = Math.max(1, stopResponses.size() / 5);
            for (int i = step; i < stopResponses.size() - 1; i += step) {
                pathPreview.add(stopResponses.get(i).getStopName());
            }
            pathPreview.add(stopResponses.get(stopResponses.size() - 1).getStopName());
        }

        return BusRouteResponse.builder()
                .id(r.getId())
                .routeNo(r.getRouteNo())
                .routeType(r.getRouteType())
                .category(r.getCategory())
                .from(r.getFromStop())
                .to(r.getToStop())
                .viaSummary(fromJson(r.getViaSummaryJson()))
                .distanceKm(r.getDistanceKm())
                .stopsCount(r.getStopsCount())
                .headwayMinutes(r.getHeadwayMinutes())
                .busesOnRoute(r.getBusesOnRoute())
                .fareMin(r.getFareMin())
                .fareMax(r.getFareMax())
                .pathPreview(pathPreview)
                .stops(stopResponses)
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
