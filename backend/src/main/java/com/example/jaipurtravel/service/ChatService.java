package com.example.jaipurtravel.service;

import com.example.jaipurtravel.dto.request.ChatMessageRequest;
import com.example.jaipurtravel.dto.response.ChatReplyResponse;
import com.example.jaipurtravel.dto.response.ChatSessionResponse;
import java.util.List;

public interface ChatService {
    ChatReplyResponse processMessage(ChatMessageRequest request, String email);
    List<ChatSessionResponse> getSessions(String email);
    ChatSessionResponse getSession(Long sessionId, String email);
    void deleteSession(Long sessionId, String email);
}
