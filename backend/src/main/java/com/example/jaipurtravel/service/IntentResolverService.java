package com.example.jaipurtravel.service;

import com.example.jaipurtravel.entity.MessageType;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

/**
 * Keyword-based intent detection for chat messages.
 * Maps user messages to MessageType for DB-grounded routing.
 */
@Service
public class IntentResolverService {

    private static final Map<MessageType, List<String>> INTENT_KEYWORDS = Map.ofEntries(
            Map.entry(MessageType.PLACE_INFO, List.of(
                    "tell me about", "what is", "describe", "info about", "details of",
                    "fort", "palace", "mahal", "temple", "museum", "monument",
                    "amber", "hawa", "nahargarh", "jantar", "albert", "city palace")),
            Map.entry(MessageType.ROUTE_INFO, List.of(
                    "how to go", "how do i get", "bus from", "route from", "bus to",
                    "bus number", "bus route", "reach", "transport to", "commute")),
            Map.entry(MessageType.WEATHER_INFO, List.of(
                    "weather", "temperature", "rain", "hot", "cold", "humid",
                    "forecast", "climate", "sunny", "monsoon")),
            Map.entry(MessageType.ITINERARY_INFO, List.of(
                    "plan", "itinerary", "day trip", "suggest places", "things to do",
                    "what to see", "recommendations", "schedule", "tour plan")),
            Map.entry(MessageType.TRIP_INFO, List.of(
                    "my trips", "saved trips", "my itinerary", "my plans",
                    "show trips", "trip history")),
            Map.entry(MessageType.FOOD_INFO, List.of(
                    "food", "cafe", "restaurant", "eat", "drink", "lassi",
                    "breakfast", "lunch", "dinner", "snack", "bar", "pub",
                    "nightlife", "where to eat", "best food")),
            Map.entry(MessageType.HOTEL_INFO, List.of(
                    "hotel", "hotels", "stay", "accommodation", "hostel", "resort",
                    "lodge", "where to stay", "book hotel", "room", "check in",
                    "check out", "per night", "budget hotel", "luxury hotel",
                    "5 star", "4 star", "3 star", "heritage hotel", "guest house"))
    );

    public MessageType resolveIntent(String message) {
        String lower = message.toLowerCase().trim();

        for (var entry : INTENT_KEYWORDS.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (lower.contains(keyword)) {
                    return entry.getKey();
                }
            }
        }

        // Budget-related heuristics
        if (lower.contains("budget") || lower.contains("cost") || lower.contains("cheap") || lower.contains("expensive")) {
            return MessageType.ITINERARY_INFO;
        }

        return MessageType.GENERAL_CHAT;
    }

    /** Extract a potential place name from the message for DB lookup. */
    public String extractPlaceHint(String message) {
        String lower = message.toLowerCase().trim();
        // Remove common prefixes
        for (String prefix : List.of("tell me about", "what is", "describe", "info about", "details of", "about")) {
            if (lower.startsWith(prefix)) {
                return lower.substring(prefix.length()).trim().replaceAll("[?.!]", "");
            }
        }
        return lower;
    }
}
