package com.example.jaipurtravel.controller;

import com.example.jaipurtravel.common.ApiResponse;
import com.example.jaipurtravel.dto.request.ChatMessageRequest;
import com.example.jaipurtravel.dto.response.ChatReplyResponse;
import com.example.jaipurtravel.dto.response.ChatSessionResponse;
import com.example.jaipurtravel.service.AnalyticsService;
import com.example.jaipurtravel.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "AI-powered travel assistant with DB-grounded responses")
public class ChatController {

    private final ChatService chatService;
    private final AnalyticsService analyticsService;

    @PostMapping("/message")
    @Operation(summary = "Send a chat message — intent is auto-detected, DB answered first, AI fallback")
    public ResponseEntity<ApiResponse<ChatReplyResponse>> message(
            @Valid @RequestBody ChatMessageRequest request, Authentication auth) {
        String email = extractEmail(auth);
        ChatReplyResponse reply = chatService.processMessage(request, email);
        analyticsService.logEvent("CHAT_MESSAGE", email, request.getMessage());
        return ResponseEntity.ok(ApiResponse.ok("Chat reply generated", reply));
    }

    @GetMapping("/sessions")
    @Operation(summary = "List all chat sessions for the authenticated user")
    public ResponseEntity<ApiResponse<List<ChatSessionResponse>>> sessions(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Sessions fetched",
                chatService.getSessions(extractEmail(auth))));
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Get a chat session with all messages")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> session(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Session fetched",
                chatService.getSession(id, extractEmail(auth))));
    }

    @DeleteMapping("/sessions/{id}")
    @Operation(summary = "Delete a chat session")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable Long id, Authentication auth) {
        chatService.deleteSession(id, extractEmail(auth));
        return ResponseEntity.ok(ApiResponse.ok("Session deleted"));
    }

    private String extractEmail(Authentication auth) {
        return ((UserDetails) auth.getPrincipal()).getUsername();
    }
}
