package com.example.jaipurtravel.service.impl;

import com.example.jaipurtravel.dto.request.ChatMessageRequest;
import com.example.jaipurtravel.dto.response.*;
import com.example.jaipurtravel.entity.*;
import com.example.jaipurtravel.exception.ResourceNotFoundException;
import com.example.jaipurtravel.integration.HuggingFaceClient;
import com.example.jaipurtravel.repository.*;
import com.example.jaipurtravel.service.*;
import com.example.jaipurtravel.dto.response.HotelResponse;
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
public class ChatServiceImpl implements ChatService {

    private final ChatSessionRepository sessionRepo;
    private final ChatMessageRepository messageRepo;
    private final UserRepository userRepo;
    private final PlaceRepository placeRepo;
    private final BusRouteRepository busRouteRepo;
    private final TripRepository tripRepo;
    private final IntentResolverService intentResolver;
    private final WeatherService weatherService;
    private final HuggingFaceClient huggingFaceClient;
    private final HotelService hotelService;

    @Override
    @Transactional
    public ChatReplyResponse processMessage(ChatMessageRequest req, String email) {
        User user = findUser(email);
        String userMessage = req.getMessage() != null ? req.getMessage().trim() : "";
        ChatSession session = resolveSession(req.getSessionId(), user, req.getMessage());

        // Save user message
        ChatMessage userMsg = ChatMessage.builder()
                .session(session).role("user").content(req.getMessage())
                .messageType(MessageType.GENERAL_CHAT).build();
        messageRepo.save(userMsg);
        // ✅ Handle simple greetings directly.
        // Do not call HuggingFace for "hi", "hello", etc.
        if (isGreeting(userMessage)) {
            ChatResult result = new ChatResult(
                    "Hi! I’m your Jaipur travel assistant. I can help you find places, plan Jaipur trips, suggest bus routes, check weather, and recommend cafes or attractions. What would you like to explore today?",
                    "DB",
                    List.of(
                            "Tell me about Hawa Mahal",
                            "Plan a 2-day Jaipur trip",
                            "How do I go from Ajmeri Gate to Amber Fort?"),
                    null);

            ChatMessage assistantMsg = ChatMessage.builder()
                    .session(session)
                    .role("assistant")
                    .content(result.reply)
                    .messageType(MessageType.GENERAL_CHAT)
                    .build();

            messageRepo.save(assistantMsg);

            return ChatReplyResponse.builder()
                    .sessionId(session.getId())
                    .messageType(MessageType.GENERAL_CHAT.name())
                    .reply(result.reply)
                    .sourceType(result.sourceType)
                    .suggestions(result.suggestions)
                    .relatedData(result.relatedData)
                    .build();
        }

        // Detect intent
        MessageType intent = intentResolver.resolveIntent(req.getMessage());
        log.info("Chat intent for '{}': {}", truncate(req.getMessage(), 60), intent);

        // Route to handler
        ChatResult result = switch (intent) {
            case PLACE_INFO -> handlePlaceQuery(req.getMessage());
            case ROUTE_INFO -> handleRouteQuery(req.getMessage());
            case WEATHER_INFO -> handleWeatherQuery(req.getMessage(), req.getCity());
            case ITINERARY_INFO -> handleItineraryQuery(req.getMessage());
            case TRIP_INFO -> handleTripQuery(user);
            case FOOD_INFO -> handleFoodQuery(req.getMessage());
            case HOTEL_INFO -> handleHotelQuery(req.getMessage());
            default -> handleGeneralChat(req.getMessage(), req.getCity());
        };

        // Save assistant message
        ChatMessage assistantMsg = ChatMessage.builder()
                .session(session).role("assistant").content(result.reply)
                .messageType(intent).build();
        messageRepo.save(assistantMsg);

        return ChatReplyResponse.builder()
                .sessionId(session.getId())
                .messageType(intent.name())
                .reply(result.reply)
                .sourceType(result.sourceType)
                .suggestions(result.suggestions)
                .relatedData(result.relatedData)
                .build();
    }

    private boolean isGreeting(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }

        String clean = message.trim().toLowerCase();

        return clean.equals("hi")
                || clean.equals("hii")
                || clean.equals("hello")
                || clean.equals("hey")
                || clean.equals("hey there")
                || clean.equals("good morning")
                || clean.equals("good afternoon")
                || clean.equals("good evening")
                || clean.equals("namaste")
                || clean.equals("namaskar");
    }

    // ── Intent handlers ─────────────────────────────────────────────

    private ChatResult handlePlaceQuery(String message) {
        String hint = intentResolver.extractPlaceHint(message);
        List<Place> matches = placeRepo.search(hint);
        if (matches.isEmpty()) {
            // Try broader search
            String[] words = hint.split("\\s+");
            for (String word : words) {
                if (word.length() >= 3) {
                    matches = placeRepo.search(word);
                    if (!matches.isEmpty())
                        break;
                }
            }
        }

        if (!matches.isEmpty()) {
            Place p = matches.get(0);
            StringBuilder sb = new StringBuilder();
            sb.append("## ").append(p.getName()).append("\n\n");
            if (p.getTagline() != null)
                sb.append("*").append(p.getTagline()).append("*\n\n");
            if (p.getOverview() != null)
                sb.append(p.getOverview()).append("\n\n");
            sb.append("📍 **Area:** ").append(p.getArea()).append("\n");
            sb.append("🏷️ **Category:** ").append(p.getCategory()).append("\n");
            if (p.getEntryFee() != null)
                sb.append("🎟️ **Entry Fee:** ₹").append(p.getEntryFee()).append("\n");
            if (p.getOpenHours() != null)
                sb.append("🕐 **Hours:** ").append(p.getOpenHours()).append("\n");
            if (p.getBestTime() != null)
                sb.append("⏰ **Best Time:** ").append(p.getBestTime()).append("\n");
            if (p.getDuration() != null)
                sb.append("⏱️ **Duration:** ").append(p.getDuration()).append("\n");
            if (p.getRating() != null)
                sb.append("⭐ **Rating:** ").append(p.getRating()).append("/5\n");
            if (p.getTip() != null)
                sb.append("\n💡 **Tip:** ").append(p.getTip()).append("\n");

            Map<String, Object> related = new LinkedHashMap<>();
            related.put("placeId", p.getId());
            related.put("slug", p.getSlug());

            List<String> suggestions = new ArrayList<>();
            suggestions.add("What are the nearby food options?");
            suggestions.add("How do I reach " + p.getName() + "?");
            suggestions.add("Show me similar places");

            return new ChatResult(sb.toString(), "DB", suggestions, related);
        }

        // Fall back to AI
        return aiWithContext("The user is asking about a place in Jaipur: \"" + message + "\"", message);
    }

    private ChatResult handleRouteQuery(String message) {
        String lower = message.toLowerCase();
        // Try to extract "from X to Y" pattern
        String from = null, to = null;
        int fromIdx = lower.indexOf("from ");
        int toIdx = lower.indexOf(" to ");
        if (fromIdx >= 0 && toIdx > fromIdx) {
            from = message.substring(fromIdx + 5, toIdx).trim();
            to = message.substring(toIdx + 4).trim().replaceAll("[?.!]", "");
        }

        if (from != null && to != null) {
            // Search routes containing both stops
            final String destStop = to;
            List<com.example.jaipurtravel.entity.BusRoute> fromRoutes = busRouteRepo.findRoutesContainingStop(from);
            if (!fromRoutes.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                sb.append("🚌 **Bus options from ").append(from).append(" to ").append(destStop).append(":**\n\n");
                int count = 0;
                for (var route : fromRoutes) {
                    boolean servesTo = route.getStops().stream()
                            .anyMatch(s -> s.getStopName().toLowerCase().contains(destStop.toLowerCase()));
                    if (servesTo) {
                        sb.append("- **Bus ").append(route.getRouteNo()).append("** (")
                                .append(route.getFromStop()).append(" → ").append(route.getToStop()).append(")")
                                .append(" | Fare: ₹").append(route.getFareMin()).append("–₹").append(route.getFareMax())
                                .append("\n");
                        count++;
                    }
                    if (count >= 5)
                        break;
                }
                if (count == 0) {
                    sb.append("No direct bus found. Try the Route Planner for one-change options.\n");
                }
                sb.append("\n💡 Use the **Route Planner** for detailed stop-by-stop directions.");
                return new ChatResult(sb.toString(), "DB",
                        List.of("Show me all bus routes", "What about auto/cab options?"), null);
            }
        }

        // Generic bus info
        long totalRoutes = busRouteRepo.count();
        String reply = "🚌 I can help you find Jaipur city bus routes. Please tell me your starting point and destination.\n\n"
                +
                "For example: \"How do I go from Ajmeri Gate to Amber Fort?\"";
        return new ChatResult(reply, "DB", List.of("Show all bus routes", "Plan a route"), null);
    }

    private ChatResult handleWeatherQuery(String message, String city) {
        String targetCity = city != null ? city : "Jaipur";
        String summary = weatherService.getWeatherSummary(targetCity);

        StringBuilder sb = new StringBuilder();
        sb.append("🌤️ **").append(summary).append("**\n\n");

        // Add travel advice
        try {
            var advice = weatherService.getTravelAdvice(targetCity);
            sb.append(advice.getOverallAdvice()).append("\n\n");
            if (advice.getRecommendations() != null) {
                sb.append("**Tips:**\n");
                advice.getRecommendations().forEach(r -> sb.append("- ").append(r).append("\n"));
            }
            if (advice.getSuggestedPlaces() != null && !advice.getSuggestedPlaces().isEmpty()) {
                sb.append("\n**Suggested places for this weather:**\n");
                advice.getSuggestedPlaces().forEach(
                        p -> sb.append("- ").append(p.getName()).append(" (").append(p.getReason()).append(")\n"));
            }
        } catch (Exception e) {
            log.warn("Could not add travel advice to chat: {}", e.getMessage());
        }

        return new ChatResult(sb.toString(), "DB",
                List.of("What should I wear?", "Best time to visit forts?", "Plan a trip considering weather"), null);
    }

    private ChatResult handleItineraryQuery(String message) {
        String lower = message.toLowerCase();
        // Try to extract days/budget from message
        int days = extractNumber(lower, "day");
        if (days <= 0)
            days = 2;

        long placeCount = placeRepo.count();
        StringBuilder sb = new StringBuilder();
        sb.append("📋 I can help you plan! We have **").append(placeCount).append(" places** in our database.\n\n");
        sb.append("Use the **Itinerary Planner** endpoint:\n");
        sb.append("```\nPOST /api/planner/generate\n{\n");
        sb.append("  \"city\": \"jaipur\",\n");
        sb.append("  \"days\": ").append(days).append(",\n");
        sb.append("  \"interests\": [\"Heritage\", \"Food\"],\n");
        sb.append("  \"travelStyle\": \"comfort\"\n}\n```\n\n");
        sb.append("Or tell me more about your preferences and I'll help refine the plan!");

        return new ChatResult(sb.toString(), "DB",
                List.of("Plan a 2-day budget trip", "What are the must-see places?", "Suggest a family itinerary"),
                null);
    }

    private ChatResult handleTripQuery(User user) {
        List<com.example.jaipurtravel.entity.Trip> trips = tripRepo.findByUserOrderByCreatedAtDesc(user);
        if (trips.isEmpty()) {
            return new ChatResult("You don't have any saved trips yet. " +
                    "Use the **Itinerary Planner** to generate one and save it!", "DB",
                    List.of("Plan a new trip", "Show me popular places"), null);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📁 **Your saved trips:**\n\n");
        for (var trip : trips) {
            sb.append("- **").append(trip.getTitle()).append("** | ")
                    .append(trip.getDays()).append(" days | ")
                    .append(trip.getCity()).append(" | ₹").append(trip.getTotalCost())
                    .append(" | ").append(trip.getCreatedAt().toLocalDate())
                    .append("\n");
        }
        sb.append("\nUse `GET /api/trips/{id}` to view full details.");

        Map<String, Object> related = new LinkedHashMap<>();
        related.put("tripCount", trips.size());
        return new ChatResult(sb.toString(), "DB",
                List.of("Show details of my latest trip", "Plan a new trip"), related);
    }

    private ChatResult handleHotelQuery(String message) {
        String lower = message.toLowerCase();

        // Extract budget hint
        java.math.BigDecimal budgetMax = null;
        if (lower.contains("under ") || lower.contains("below ") || lower.contains("less than ")) {
            try {
                String[] parts = lower.split("[^\\d]+");
                for (String p : parts) {
                    if (p.length() >= 3) {
                        budgetMax = new java.math.BigDecimal(p);
                        break;
                    }
                }
            } catch (Exception ignored) {}
        }

        // Extract area hint
        String area = null;
        for (String a : List.of("mi road", "bani park", "c-scheme", "vaishali nagar",
                "malviya nagar", "tonk road", "amer road", "sindhi camp",
                "mansarovar", "airport", "civil lines", "johari bazaar")) {
            if (lower.contains(a)) { area = a; break; }
        }

        var req = new com.example.jaipurtravel.dto.request.HotelSearchRequest();
        req.setCity("jaipur");
        req.setArea(area);
        req.setBudgetMax(budgetMax);
        req.setSearchText(null);

        var hotels = hotelService.searchHotels(req);
        if (hotels.isEmpty()) {
            return new ChatResult(
                    "🏨 I couldn't find hotels matching your criteria. Try the **Hotels** page to search with full filters!",
                    "DB",
                    List.of("Show all hotels in Jaipur", "Hotels near Hawa Mahal", "Budget hotels under ₹2000"),
                    null);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Here are some estimated hotel options in Jaipur");
        if (area != null) sb.append(" near ").append(area);
        if (budgetMax != null) sb.append(" under ₹").append(budgetMax.toPlainString());
        sb.append(". Live prices are currently unavailable, so I’m showing estimated ranges from our Jaipur hotel database.\n\n");

        hotels.stream().limit(5).forEach(h -> {
            sb.append("- **").append(h.getName()).append("** | ")
              .append(h.getArea()).append(" | ");
            if (h.getStarRating() != null) sb.append("⭐".repeat(Math.min(h.getStarRating(), 5))).append(" | ");
            if (h.getPriceMin() != null) sb.append("₹").append(h.getPriceMin().toPlainString());
            if (h.getPriceMax() != null) sb.append("–₹").append(h.getPriceMax().toPlainString());
            sb.append("/night");
            if (h.getCheapestVendor() != null) sb.append(" via ").append(h.getCheapestVendor());
            sb.append("\n");
        });

        sb.append("\n💡 Visit the **Hotels** page for live prices, date search, and full filters.");

        Map<String, Object> related = new LinkedHashMap<>();
        related.put("hotelCount", hotels.size());
        related.put("priceType", "ESTIMATED");

        return new ChatResult(sb.toString(), "DB",
                List.of("Hotels near Amber Fort", "Budget hotels under ₹2000", "Luxury hotels in Jaipur"),
                related);
    }

    private ChatResult handleFoodQuery(String message) {
        List<Place> foodPlaces = new ArrayList<>();
        foodPlaces.addAll(placeRepo.findByCategoryIgnoreCase("Cafes"));
        foodPlaces.addAll(placeRepo.findByCategoryIgnoreCase("Bars"));
        foodPlaces.addAll(placeRepo.findByTag("food"));
        foodPlaces.addAll(placeRepo.findByTag("dining"));
        // Deduplicate
        Set<Long> seen = new HashSet<>();
        foodPlaces = foodPlaces.stream().filter(p -> seen.add(p.getId())).collect(Collectors.toList());

        if (foodPlaces.isEmpty()) {
            return aiWithContext("User is asking about food/dining in Jaipur: \"" + message + "\"", message);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("🍽️ **Food & Dining in Jaipur:**\n\n");
        for (Place p : foodPlaces) {
            sb.append("- **").append(p.getName()).append("** | ")
                    .append(p.getCategory()).append(" | ").append(p.getArea());
            if (p.getRating() != null)
                sb.append(" | ⭐ ").append(p.getRating());
            if (p.getEstimatedSpend() != null)
                sb.append(" | ~₹").append(p.getEstimatedSpend());
            sb.append("\n");
            if (p.getTagline() != null)
                sb.append("  _").append(p.getTagline()).append("_\n");
        }

        return new ChatResult(sb.toString(), "DB",
                List.of("Which one is best for couples?", "Budget food options?", "Best rooftop cafes?"), null);
    }

    private ChatResult handleGeneralChat(String message, String city) {
        // Build context from DB
        String context = buildContext(city);
        return aiWithContext(context, message);
    }

    // ── AI fallback ─────────────────────────────────────────────────

    private ChatResult aiWithContext(String context, String userMessage) {
        if (!huggingFaceClient.isConfigured()) {
            return new ChatResult(
                    "I'm your Jaipur travel assistant! I can help with:\n\n" +
                            "- 🏰 **Place info** — \"Tell me about Hawa Mahal\"\n" +
                            "- 🚌 **Bus routes** — \"How to go from X to Y?\"\n" +
                            "- 🌤️ **Weather** — \"What's the weather like?\"\n" +
                            "- 📋 **Trip planning** — \"Plan a 2-day trip\"\n" +
                            "- 🍽️ **Food** — \"Best cafes in Jaipur\"\n\n" +
                            "Try one of these queries!",
                    "DB",
                    List.of("Tell me about Amber Fort", "What's the weather?", "Plan a 3-day trip"), null);
        }

        String prompt = "[INST] You are a helpful Jaipur travel assistant. " +
                "Answer based on the context provided. Stay factual and concise. " +
                "Do not invent place names or routes that aren't in the context.\n\n" +
                "Context:\n" + context + "\n\n" +
                "User question: " + userMessage + " [/INST]";

        String aiReply = huggingFaceClient.chat(prompt);
        if (aiReply.isBlank()) {
            return new ChatResult("I'm sorry, I couldn't generate a response right now. " +
                    "Try asking about specific places, routes, or weather!", "AI",
                    List.of("Tell me about Hawa Mahal", "What's the weather?"), null);
        }
        return new ChatResult(aiReply, "AI",
                List.of("Tell me more", "Plan a trip based on this"), null);
    }

    private String buildContext(String city) {
        String targetCity = city != null ? city : "Jaipur";
        StringBuilder ctx = new StringBuilder();

        // Top places summary
        List<Place> places = placeRepo.findFeaturedByCity(targetCity.toLowerCase());
        if (!places.isEmpty()) {
            ctx.append("Popular places in ").append(targetCity).append(": ");
            places.stream().limit(8)
                    .forEach(p -> ctx.append(p.getName()).append(" (").append(p.getCategory()).append("), "));
            ctx.append("\n");
        }

        // Weather
        ctx.append(weatherService.getWeatherSummary(targetCity)).append("\n");

        // Bus routes
        long routes = busRouteRepo.count();
        ctx.append(targetCity).append(" has ").append(routes).append(" bus routes.\n");

        return ctx.toString();
    }

    // ── Session management ──────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getSessions(String email) {
        User user = findUser(email);
        return sessionRepo.findByUserOrderByCreatedAtDesc(user).stream()
                .map(s -> ChatSessionResponse.builder()
                        .id(s.getId()).title(s.getTitle()).messages(null)
                        .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null).build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChatSessionResponse getSession(Long sessionId, String email) {
        User user = findUser(email);
        ChatSession session = sessionRepo.findByIdAndUser(sessionId, user)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", sessionId));

        List<ChatMessageResponse> msgs = session.getMessages().stream()
                .map(m -> ChatMessageResponse.builder()
                        .id(m.getId()).role(m.getRole()).content(m.getContent())
                        .messageType(m.getMessageType().name())
                        .createdAt(m.getCreatedAt() != null ? m.getCreatedAt().toString() : null).build())
                .collect(Collectors.toList());

        return ChatSessionResponse.builder()
                .id(session.getId()).title(session.getTitle())
                .messages(msgs)
                .createdAt(session.getCreatedAt() != null ? session.getCreatedAt().toString() : null)
                .build();
    }

    @Override
    @Transactional
    public void deleteSession(Long sessionId, String email) {
        User user = findUser(email);
        ChatSession session = sessionRepo.findByIdAndUser(sessionId, user)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", sessionId));
        sessionRepo.delete(session);
        log.info("Chat session deleted: id={} by user {}", sessionId, email);
    }

    private ChatSession resolveSession(Long sessionId, User user, String firstMessage) {
        if (sessionId != null) {
            return sessionRepo.findByIdAndUser(sessionId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", sessionId));
        }
        // Create new session with auto-generated title
        String title = firstMessage.length() > 50 ? firstMessage.substring(0, 47) + "..." : firstMessage;
        ChatSession session = ChatSession.builder().user(user).title(title).build();
        return sessionRepo.save(session);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private String truncate(String s, int max) {
        return s.length() > max ? s.substring(0, max) + "..." : s;
    }

    private int extractNumber(String text, String unit) {
        try {
            String[] parts = text.split("\\s+");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].contains(unit) && i > 0) {
                    return Integer.parseInt(parts[i - 1].replaceAll("[^0-9]", ""));
                }
            }
        } catch (NumberFormatException ignored) {
        }
        return -1;
    }

    private record ChatResult(String reply, String sourceType, List<String> suggestions,
            Map<String, Object> relatedData) {
    }
}
