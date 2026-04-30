package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.AnalyticsEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    List<AnalyticsEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<AnalyticsEvent> findByEventTypeOrderByCreatedAtDesc(String eventType, Pageable pageable);

    @Query("SELECT e.eventType, COUNT(e) FROM AnalyticsEvent e GROUP BY e.eventType ORDER BY COUNT(e) DESC")
    List<Object[]> countByEventType();

    @Query("SELECT e.queryText, COUNT(e) FROM AnalyticsEvent e WHERE e.queryText IS NOT NULL " +
           "GROUP BY e.queryText ORDER BY COUNT(e) DESC")
    List<Object[]> topQueries(Pageable pageable);
}
