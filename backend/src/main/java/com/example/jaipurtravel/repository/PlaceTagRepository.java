package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.PlaceTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaceTagRepository extends JpaRepository<PlaceTag, Long> {
}
