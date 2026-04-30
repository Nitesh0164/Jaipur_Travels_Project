package com.example.jaipurtravel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // nullable — anonymous events possible

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "query_text", length = 500)
    private String queryText;

    @Column(name = "meta_json", columnDefinition = "TEXT")
    private String metaJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
