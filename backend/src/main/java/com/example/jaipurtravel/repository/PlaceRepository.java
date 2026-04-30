package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {

    Optional<Place> findBySlug(String slug);

    List<Place> findByCityIgnoreCase(String city);

    List<Place> findByCategoryIgnoreCase(String category);

    List<Place> findByAreaContainingIgnoreCase(String area);

    List<Place> findByMustSeeTrue();

    @Query("SELECT p FROM Place p WHERE p.mustSee = true AND p.city = :city")
    List<Place> findFeaturedByCity(@Param("city") String city);

    @Query("SELECT p FROM Place p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(p.area) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(p.tagline) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Place> search(@Param("q") String query);

    @Query("SELECT DISTINCT p FROM Place p JOIN p.tags t WHERE LOWER(t.tag) = LOWER(:tag)")
    List<Place> findByTag(@Param("tag") String tag);

    @Query("SELECT DISTINCT p.category FROM Place p ORDER BY p.category")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT p.area FROM Place p WHERE p.area IS NOT NULL ORDER BY p.area")
    List<String> findDistinctAreas();

    @Query("SELECT DISTINCT t.tag FROM PlaceTag t ORDER BY t.tag")
    List<String> findDistinctTags();

    @Query("SELECT p FROM Place p WHERE p.category = :category AND p.id <> :excludeId")
    List<Place> findSimilar(@Param("category") String category, @Param("excludeId") Long excludeId);
}
