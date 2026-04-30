package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.Trip;
import com.example.jaipurtravel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByUserOrderByCreatedAtDesc(User user);

    Optional<Trip> findByIdAndUser(Long id, User user);

    long countByUser(User user);
}
