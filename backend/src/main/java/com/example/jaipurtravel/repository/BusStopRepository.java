package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusStopRepository extends JpaRepository<BusStop, Long> {

    @Query("SELECT DISTINCT s.stopName FROM BusStop s WHERE LOWER(s.stopName) LIKE LOWER(CONCAT('%',:q,'%')) ORDER BY s.stopName")
    List<String> suggestStops(@Param("q") String query);
}
