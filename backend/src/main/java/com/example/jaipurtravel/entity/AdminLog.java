package com.example.jaipurtravel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(nullable = false, length = 50)
    private String action; // CREATE, UPDATE, DELETE

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // PLACE, BUS_ROUTE

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "meta_json", columnDefinition = "TEXT")
    private String metaJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
