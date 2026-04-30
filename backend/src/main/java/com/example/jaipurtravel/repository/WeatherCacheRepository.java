package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.WeatherCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WeatherCacheRepository extends JpaRepository<WeatherCache, Long> {
    Optional<WeatherCache> findByCityIgnoreCaseAndCacheType(String city, String cacheType);
}
