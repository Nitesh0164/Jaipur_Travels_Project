package com.example.jaipurtravel.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.*;

/**
 * Wraps the Hugging Face Inference API. Called only from the backend —
 * API key is never exposed to the frontend.
 */
@Slf4j
@Component
public class HuggingFaceClient {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;
    private final String model;

    public HuggingFaceClient(
            RestTemplate restTemplate,
            @Value("${app.huggingface.api-key:}") String apiKey,
            @Value("${app.huggingface.base-url:https://api-inference.huggingface.co/models}") String baseUrl,
            @Value("${app.huggingface.model:mistralai/Mistral-7B-Instruct-v0.2}") String model) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Sends a prompt to HF and returns the generated text.
     * Returns empty string on failure (caller should handle gracefully).
     */
    public String chat(String prompt) {
        if (!isConfigured()) {
            log.warn("HuggingFace API key not configured — skipping AI call");
            return "";
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("inputs", prompt);
            body.put("parameters", Map.of(
                    "max_new_tokens", 500,
                    "temperature", 0.7,
                    "return_full_text", false));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            String url = baseUrl + "/" + model;

            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.POST, request, List.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null
                    && !response.getBody().isEmpty()) {
                Object first = response.getBody().get(0);
                if (first instanceof Map) {
                    Object text = ((Map<?, ?>) first).get("generated_text");
                    return text != null ? text.toString().trim() : "";
                }
            }
            return "";
        } catch (Exception e) {
            log.error("HuggingFace API call failed: {}", e.getMessage());
            return "";
        }
    }
}
