package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.Hotel;
import com.example.jaipurtravel.entity.HotelPriceCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HotelPriceCacheRepository extends JpaRepository<HotelPriceCache, Long> {

    @Query("""
        SELECT c FROM HotelPriceCache c
        WHERE c.hotel = :hotel
          AND c.checkIn  = :checkIn
          AND c.checkOut = :checkOut
          AND c.adults   = :adults
          AND c.rooms    = :rooms
          AND c.expiresAt > :now
        ORDER BY c.createdAt DESC
        """)
    Optional<HotelPriceCache> findValidCache(
            @Param("hotel")    Hotel hotel,
            @Param("checkIn")  LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("adults")   int adults,
            @Param("rooms")    int rooms,
            @Param("now")      LocalDateTime now
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM HotelPriceCache c WHERE c.expiresAt < :now")
    void deleteExpired(@Param("now") LocalDateTime now);

    List<HotelPriceCache> findByHotel(Hotel hotel);
}
