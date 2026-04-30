package com.example.jaipurtravel.repository;

import com.example.jaipurtravel.entity.ChatSession;
import com.example.jaipurtravel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserOrderByCreatedAtDesc(User user);
    Optional<ChatSession> findByIdAndUser(Long id, User user);
}
