package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByCityIgnoreCase(String city);

    List<Hotel> findByAreaContainingIgnoreCase(String area);

    Optional<Hotel> findBySourceAndSourceHotelId(String source, String sourceHotelId);

    @Query("""
        SELECT h FROM Hotel h WHERE h.city = :city
          AND (:area IS NULL OR LOWER(h.area) LIKE LOWER(CONCAT('%',:area,'%')))
          AND (:minPrice IS NULL OR h.priceMin >= :minPrice)
          AND (:maxPrice IS NULL OR h.priceMax <= :maxPrice)
          AND (:rating IS NULL OR h.rating >= :rating)
          AND (:text IS NULL OR
               LOWER(h.name) LIKE LOWER(CONCAT('%',:text,'%')) OR
               LOWER(h.area) LIKE LOWER(CONCAT('%',:text,'%')) OR
               LOWER(h.address) LIKE LOWER(CONCAT('%',:text,'%')))
        ORDER BY h.rating DESC NULLS LAST
        """)
    List<Hotel> search(
            @Param("city")     String city,
            @Param("area")     String area,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            @Param("rating")   java.math.BigDecimal rating,
            @Param("text")     String text
    );

    @Query("""
        SELECT h FROM Hotel h WHERE h.city = :city
          AND (LOWER(h.area) LIKE LOWER(CONCAT('%',:place,'%'))
               OR LOWER(h.address) LIKE LOWER(CONCAT('%',:place,'%'))
               OR LOWER(h.name) LIKE LOWER(CONCAT('%',:place,'%')))
        ORDER BY h.rating DESC NULLS LAST
        """)
    List<Hotel> findNearbyPlace(
            @Param("city")  String city,
            @Param("place") String place
    );
}
