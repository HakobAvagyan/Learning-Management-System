package com.lms.chatservice.repository;

import com.lms.chatservice.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("""
            SELECT m FROM ChatMessage m
            WHERE (m.senderId = :a AND m.recipientId = :b)
               OR (m.senderId = :b AND m.recipientId = :a)
            ORDER BY m.createdAt ASC
            """)
    List<ChatMessage> findConversation(@Param("a") Long a, @Param("b") Long b);

    @Query("""
            SELECT DISTINCT
              CASE WHEN m.senderId = :userId THEN m.recipientId ELSE m.senderId END
            FROM ChatMessage m
            WHERE m.senderId = :userId OR m.recipientId = :userId
            """)
    List<Long> findDistinctConversationPartners(@Param("userId") Long userId);
}