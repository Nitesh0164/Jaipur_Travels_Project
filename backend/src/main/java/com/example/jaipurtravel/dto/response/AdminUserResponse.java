package com.example.jaipurtravel.dto.response;

import lombok.Builder;
import lombok.Data;

/** Admin-safe user summary — no password hash exposed. */
@Data @Builder
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String createdAt;
}
