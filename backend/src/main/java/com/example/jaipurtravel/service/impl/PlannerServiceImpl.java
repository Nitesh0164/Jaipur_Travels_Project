package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.request.GeneratePlannerRequest;
import com.example.jaipurtravel.dto.request.RefinePlannerRequest;
import com.example.jaipurtravel.dto.response.PlannerResponse;
import com.example.jaipurtravel.dto.response.PlannerResponse.*;
import com.example.jaipurtravel.entity.BusRoute;
import com.example.jaipurtravel.entity.BusStop;
import com.example.jaipurtravel.entity.Place;
import com.example.jaipurtravel.entity.PlaceTag;
import com.example.jaipurtravel.repository.BusRouteRepository;
import com.example.jaipurtravel.repository.PlaceRepository;
import com.example.jaipurtravel.service.PlannerService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Rule-based itinerary engine that uses existing Place and BusRoute DB data
 * to generate practical, day-wise travel plans. No AI — fully deterministic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlannerServiceImpl implements PlannerService {

    private final PlaceRepository placeRepository;
    private final BusRouteRepository busRouteRepository;
    private final ObjectMapper objectMapper;

    // ── Style config ────────────────────────────────────────────────

    private int placesPerDay(String style) {
        if (style == null) return 4;
        return switch (style.toLowerCase()) {
            case "relaxed"          -> 3;
            case "fast-paced"       -> 6;
            case "budget"           -> 4;
            case "premium"          -> 3;
            case "family-friendly"  -> 3;
            default                 -> 4;
        };
    }

    private BigDecimal foodPerDay(String style) {
        if (style == null) return new BigDecimal("400");
        return switch (style.toLowerCase()) {
            case "budget"   -> new BigDecimal("250");
            case "premium"  -> new BigDecimal("800");
            default         -> new BigDecimal("400");
        };
    }

    private BigDecimal transportPerDay(String style) {
        if (style == null) return new BigDecimal("100");
        return switch (style.toLowerCase()) {
            case "budget"   -> new BigDecimal("50");
            case "premium"  -> new BigDecimal("300");
            default         -> new BigDecimal("100");
        };
    }

    // ── Generate ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PlannerResponse generateItinerary(GeneratePlannerRequest req) {
        String city      = req.getCity().trim().toLowerCase();
        int days         = req.getDays();
        String style     = req.getTravelStyle();
        String group     = req.getGroupType();
        List<String> interests = req.getInterests() != null ? req.getInterests() : List.of();

        // 1. Fetch and score places
        List<Place> cityPlaces = placeRepository.findByCityIgnoreCase(city);
        if (cityPlaces.isEmpty()) {
            cityPlaces = placeRepository.findAll(); // fallback
        }
        List<ScoredPlace> scored = scorePlaces(cityPlaces, interests, style, group);

        // 2. Select places based on days and style
        int maxPlaces = days * placesPerDay(style);
        List<ScoredPlace> selected = scored.stream()
                .limit(maxPlaces)
                .collect(Collectors.toList());

        // 3. Distribute across days with time slots and area grouping
        List<PlannerDay> dayPlans = distributePlaces(selected, days, style);

        // 4. Calculate budget
        PlannerBudget budget = calculateBudget(dayPlans, days, style);

        // 5. Generate transport summary
        List<String> transportSummary = generateTransportSummary(dayPlans);

        // 6. Budget verdict
        if (req.getBudget() != null && req.getBudget().compareTo(BigDecimal.ZERO) > 0) {
            String verdict = budget.getTotalEstimatedCost().compareTo(req.getBudget()) <= 0
                    ? "Within budget (₹" + budget.getTotalEstimatedCost() + " of ₹" + req.getBudget() + ")"
                    : "Over budget by ₹" + budget.getTotalEstimatedCost().subtract(req.getBudget());
            budget.setBudgetVerdict(verdict);
        }

        // 7. General notes
        List<String> notes = generateNotes(style, group, days, selected.size());

        String title = generateTitle(city, days, interests, style);
        String summary = generateSummary(city, days, selected.size(), style, group);

        return PlannerResponse.builder()
                .title(title)
                .city(city)
                .days(days)
                .summary(summary)
                .travelStyle(style)
                .groupType(group)
                .interests(interests)
                .estimatedBudget(budget)
                .dayPlans(dayPlans)
                .notes(notes)
                .transportSummary(transportSummary)
                .build();
    }

    // ── Refine ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PlannerResponse refineItinerary(RefinePlannerRequest req) {
        String instruction = req.getInstruction().toLowerCase().trim();

        // Build a modified GeneratePlannerRequest based on the instruction
        GeneratePlannerRequest modified = new GeneratePlannerRequest();
        modified.setCity(req.getCity());
        modified.setDays(req.getDays() > 0 ? req.getDays() : 3);
        modified.setBudget(req.getBudget());
        modified.setInterests(req.getInterests() != null ? new ArrayList<>(req.getInterests()) : new ArrayList<>());
        modified.setTravelStyle(req.getTravelStyle());
        modified.setGroupType(req.getGroupType());

        // Parse instruction keywords and adjust
        if (instruction.contains("lower budget") || instruction.contains("cheaper") || instruction.contains("save money")) {
            modified.setTravelStyle("budget");
            if (modified.getBudget() != null) {
                modified.setBudget(modified.getBudget().multiply(new BigDecimal("0.7")));
            }
        }
        if (instruction.contains("heritage") || instruction.contains("historical") || instruction.contains("fort") || instruction.contains("palace")) {
            modified.getInterests().add("Heritage");
        }
        if (instruction.contains("food") || instruction.contains("cafe") || instruction.contains("restaurant") || instruction.contains("eat")) {
            modified.getInterests().add("Food");
            modified.getInterests().add("Cafes");
        }
        if (instruction.contains("shopping") || instruction.contains("market") || instruction.contains("bazaar")) {
            modified.getInterests().add("Shopping");
        }
        if (instruction.contains("nightlife") || instruction.contains("bar") || instruction.contains("party")) {
            modified.getInterests().add("Bars");
            modified.getInterests().add("Nightlife");
        }
        if (instruction.contains("family") || instruction.contains("kid") || instruction.contains("child")) {
            modified.setGroupType("family");
            modified.setTravelStyle("family-friendly");
        }
        if (instruction.contains("relax") || instruction.contains("slow") || instruction.contains("less walking")) {
            modified.setTravelStyle("relaxed");
        }
        if (instruction.contains("fast") || instruction.contains("more places") || instruction.contains("pack more")) {
            modified.setTravelStyle("fast-paced");
        }
        if (instruction.contains("premium") || instruction.contains("luxury") || instruction.contains("upscale")) {
            modified.setTravelStyle("premium");
        }
        if (instruction.contains("shorten") || instruction.contains("fewer days") || instruction.contains("less days")) {
            modified.setDays(Math.max(1, modified.getDays() - 1));
        }
        if (instruction.contains("one more day") || instruction.contains("extra day") || instruction.contains("add day")) {
            modified.setDays(Math.min(14, modified.getDays() + 1));
        }

        log.info("Refined planner: instruction='{}', modified style={}, days={}, interests={}",
                instruction, modified.getTravelStyle(), modified.getDays(), modified.getInterests());

        return generateItinerary(modified);
    }

    // ── Scoring engine ──────────────────────────────────────────────

    private List<ScoredPlace> scorePlaces(List<Place> places, List<String> interests, String style, String group) {
        Set<String> interestSet = interests.stream()
                .map(String::toLowerCase).collect(Collectors.toSet());

        List<ScoredPlace> scored = new ArrayList<>();
        for (Place p : places) {
            double score = 0;

            // Must-see boost
            if (Boolean.TRUE.equals(p.getMustSee())) score += 30;

            // Rating boost
            if (p.getRating() != null) score += p.getRating().doubleValue() * 5;

            // Interest/tag match
            Set<String> placeTags = p.getTags().stream()
                    .map(t -> t.getTag().toLowerCase()).collect(Collectors.toSet());
            String cat = p.getCategory() != null ? p.getCategory().toLowerCase() : "";

            for (String interest : interestSet) {
                if (placeTags.contains(interest) || cat.contains(interest)) {
                    score += 20;
                }
            }

            // Style adjustments
            if ("budget".equalsIgnoreCase(style)) {
                BigDecimal fee = p.getEntryFee() != null ? p.getEntryFee() : BigDecimal.ZERO;
                if (fee.compareTo(new BigDecimal("100")) <= 0) score += 10;
                if (fee.compareTo(BigDecimal.ZERO) == 0) score += 5;
            }
            if ("premium".equalsIgnoreCase(style)) {
                if (p.getRating() != null && p.getRating().compareTo(new BigDecimal("4.5")) >= 0) score += 10;
            }

            // Group type adjustments
            if ("family".equalsIgnoreCase(group) || "family-friendly".equalsIgnoreCase(style)) {
                if (placeTags.contains("nightlife") || placeTags.contains("bars") || placeTags.contains("party")) {
                    score -= 30; // penalize nightlife for families
                }
                if (placeTags.contains("heritage") || placeTags.contains("museum") || cat.equals("heritage")) {
                    score += 5;
                }
            }
            if ("couple".equalsIgnoreCase(group)) {
                if (placeTags.contains("romantic") || placeTags.contains("rooftop") || placeTags.contains("sunset")) {
                    score += 10;
                }
            }
            if ("friends".equalsIgnoreCase(group)) {
                if (placeTags.contains("nightlife") || placeTags.contains("party") || placeTags.contains("cafes")) {
                    score += 10;
                }
            }

            scored.add(new ScoredPlace(p, score));
        }

        scored.sort(Comparator.comparingDouble(ScoredPlace::score).reversed());
        return scored;
    }

    private record ScoredPlace(Place place, double score) {}

    // ── Day distribution ────────────────────────────────────────────

    private List<PlannerDay> distributePlaces(List<ScoredPlace> selected, int days, String style) {
        // Group by area for smarter distribution
        Map<String, List<ScoredPlace>> byArea = new LinkedHashMap<>();
        for (ScoredPlace sp : selected) {
            String area = sp.place().getArea() != null ? sp.place().getArea() : "Central Jaipur";
            byArea.computeIfAbsent(area, k -> new ArrayList<>()).add(sp);
        }

        // Flatten back maintaining area grouping
        List<ScoredPlace> areaGrouped = new ArrayList<>();
        byArea.values().forEach(areaGrouped::addAll);

        int perDay = placesPerDay(style);
        List<PlannerDay> dayPlans = new ArrayList<>();
        String[] timeSlots = {"morning", "late morning", "afternoon", "evening", "night"};
        String[] themes = {"Heritage & Wonders", "Culture & Shopping", "Food & Cafes", "Hidden Gems",
                "Art & Architecture", "Markets & Bazaars", "Relaxation & Views", "Local Flavours"};

        int placeIdx = 0;
        for (int d = 1; d <= days; d++) {
            List<PlannerStop> stops = new ArrayList<>();
            BigDecimal dayCost = BigDecimal.ZERO;
            int count = Math.min(perDay, areaGrouped.size() - placeIdx);

            for (int s = 0; s < count && placeIdx < areaGrouped.size(); s++) {
                Place p = areaGrouped.get(placeIdx++).place();

                String timeOfDay = resolveTimeOfDay(p, s, timeSlots);
                BigDecimal spend = estimatePlaceSpend(p);
                dayCost = dayCost.add(spend);

                String transportHint = findTransportHint(p.getArea());

                stops.add(PlannerStop.builder()
                        .placeId(p.getId())
                        .slug(p.getSlug())
                        .placeName(p.getName())
                        .category(p.getCategory())
                        .area(p.getArea())
                        .suggestedTimeOfDay(timeOfDay)
                        .estimatedSpend(spend)
                        .bestTime(p.getBestTime())
                        .duration(p.getDuration())
                        .tip(p.getTip())
                        .transportHint(transportHint)
                        .build());
            }

            String theme = themes[(d - 1) % themes.length];
            if (!stops.isEmpty()) {
                // Derive theme from dominant category
                Map<String, Long> catCount = stops.stream()
                        .collect(Collectors.groupingBy(PlannerStop::getCategory, Collectors.counting()));
                String dominant = catCount.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey).orElse("Exploration");
                theme = dominant + " Day";
            }

            List<String> dayNotes = new ArrayList<>();
            if (d == 1) dayNotes.add("Start early to beat the crowds at popular spots");
            if (!stops.isEmpty() && stops.stream().anyMatch(s -> "Heritage".equals(s.getCategory()))) {
                dayNotes.add("Carry water and wear comfortable shoes for fort/palace visits");
            }
            if (stops.stream().anyMatch(s -> "evening".equals(s.getSuggestedTimeOfDay()) || "night".equals(s.getSuggestedTimeOfDay()))) {
                dayNotes.add("Evening spots are best enjoyed during golden hour or after dark");
            }

            dayPlans.add(PlannerDay.builder()
                    .dayNumber(d)
                    .theme(theme)
                    .estimatedDayCost(dayCost)
                    .stops(stops)
                    .notes(dayNotes)
                    .build());
        }

        return dayPlans;
    }

    private String resolveTimeOfDay(Place place, int slotIndex, String[] slots) {
        // Use place's bestTimeOfDay hint if available
        String btodJson = place.getBestTimeOfDayJson();
        if (btodJson != null && !btodJson.isBlank()) {
            try {
                List<String> btod = objectMapper.readValue(btodJson, new TypeReference<>() {});
                if (!btod.isEmpty()) return btod.get(0);
            } catch (JsonProcessingException ignored) {}
        }
        // Fallback by category
        String cat = place.getCategory() != null ? place.getCategory().toLowerCase() : "";
        if (cat.contains("bar") || cat.contains("nightlife")) return "evening";
        if (cat.contains("cafe") || cat.contains("food")) return slotIndex < 2 ? "morning" : "afternoon";
        if (cat.contains("shopping")) return "afternoon";
        // Use slot position
        return slots[Math.min(slotIndex, slots.length - 1)];
    }

    private BigDecimal estimatePlaceSpend(Place p) {
        BigDecimal fee = p.getEntryFee() != null ? p.getEntryFee() : BigDecimal.ZERO;
        BigDecimal extra = p.getEstimatedSpend() != null ? p.getEstimatedSpend() : BigDecimal.ZERO;
        BigDecimal total = fee.add(extra);
        return total.compareTo(BigDecimal.ZERO) > 0 ? total : new BigDecimal("50");
    }

    // ── Budget calculation ──────────────────────────────────────────

    private PlannerBudget calculateBudget(List<PlannerDay> dayPlans, int days, String style) {
        BigDecimal placesSpend = dayPlans.stream()
                .flatMap(d -> d.getStops().stream())
                .map(PlannerStop::getEstimatedSpend)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal transportSpend = transportPerDay(style).multiply(BigDecimal.valueOf(days));
        BigDecimal foodSpend = foodPerDay(style).multiply(BigDecimal.valueOf(days));
        BigDecimal miscSpend = new BigDecimal("200").multiply(BigDecimal.valueOf(days));
        BigDecimal total = placesSpend.add(transportSpend).add(foodSpend).add(miscSpend);

        return PlannerBudget.builder()
                .placesSpend(placesSpend)
                .transportSpend(transportSpend)
                .foodSpend(foodSpend)
                .miscSpend(miscSpend)
                .totalEstimatedCost(total)
                .perDayCost(days > 0 ? total.divide(BigDecimal.valueOf(days), 0, RoundingMode.CEILING) : total)
                .build();
    }

    // ── Transport ───────────────────────────────────────────────────

    private String findTransportHint(String area) {
        if (area == null || area.isBlank()) return "Auto-rickshaw or cab recommended";
        String norm = area.toLowerCase();
        // Check bus routes that serve the area
        List<BusRoute> routes = busRouteRepository.findRoutesContainingStop(norm.split(",")[0].trim());
        if (!routes.isEmpty()) {
            BusRoute r = routes.get(0);
            return "Bus " + r.getRouteNo() + " (" + r.getFromStop() + " → " + r.getToStop() + ")";
        }
        if (norm.contains("old city")) return "Walking or cycle-rickshaw within Old City walls";
        if (norm.contains("amer") || norm.contains("amber")) return "Bus AC1 or auto from Ajmeri Gate (~30 min)";
        return "Auto-rickshaw or cab recommended";
    }

    private List<String> generateTransportSummary(List<PlannerDay> dayPlans) {
        List<String> tips = new ArrayList<>();
        tips.add("Jaipur city buses run 5:30 AM – 10 PM with fares ₹5–60");
        tips.add("Auto-rickshaws: insist on meter or negotiate before boarding");
        tips.add("For forts outside the city (Amber, Nahargarh), hire a cab or take AC1 bus");
        tips.add("Old City is best explored on foot or by cycle-rickshaw");

        Set<String> areas = dayPlans.stream()
                .flatMap(d -> d.getStops().stream())
                .map(PlannerStop::getArea)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (areas.stream().anyMatch(a -> a.toLowerCase().contains("amer"))) {
            tips.add("For Amber Fort area: Bus AC1 from Badi Chopar or hire a cab (₹400–600 round trip)");
        }
        return tips;
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private String generateTitle(String city, int days, List<String> interests, String style) {
        String base = days + "-Day " + capitalize(city);
        if (interests != null && !interests.isEmpty()) {
            return base + " " + interests.get(0) + " Itinerary";
        }
        if (style != null) {
            return base + " " + capitalize(style) + " Itinerary";
        }
        return base + " Explorer Itinerary";
    }

    private String generateSummary(String city, int days, int placeCount, String style, String group) {
        String g = group != null ? " for " + group : "";
        String s = style != null ? " (" + style + " style)" : "";
        return "A curated " + days + "-day itinerary covering " + placeCount +
                " handpicked spots in " + capitalize(city) + g + s +
                ". All recommendations are based on real visitor data.";
    }

    private List<String> generateNotes(String style, String group, int days, int placeCount) {
        List<String> notes = new ArrayList<>();
        notes.add("All places are real, verified locations from our database");
        notes.add("Entry fees and timings may vary — check before visiting");
        if ("budget".equalsIgnoreCase(style)) {
            notes.add("Budget tip: Many heritage sites have free entry on certain days");
            notes.add("Use public buses (₹5–30) instead of cabs to save significantly");
        }
        if ("family".equalsIgnoreCase(group)) {
            notes.add("Family tip: Carry snacks and water for kids, especially at forts");
            notes.add("Many sites have steep stairs — plan accordingly with elderly/toddlers");
        }
        if ("couple".equalsIgnoreCase(group)) {
            notes.add("Romantic tip: Nahargarh sunset and Bar Palladio dinner make a perfect evening");
        }
        if (days >= 3) {
            notes.add("Consider dedicating one afternoon to unstructured exploration in the bazaars");
        }
        return notes;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
