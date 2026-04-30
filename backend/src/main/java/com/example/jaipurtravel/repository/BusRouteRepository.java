package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.BusRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusRouteRepository extends JpaRepository<BusRoute, Long> {

    List<BusRoute> findByRouteNoIgnoreCase(String routeNo);

    List<BusRoute> findByCategoryIgnoreCase(String category);

    @Query("SELECT DISTINCT r FROM BusRoute r JOIN r.stops s WHERE LOWER(s.stopName) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<BusRoute> findRoutesContainingStop(@Param("q") String stopQuery);
}
