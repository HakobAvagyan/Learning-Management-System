package com.lms.chatservice.repository;

import com.lms.chatservice.dto.ConversationSummary;
import com.lms.chatservice.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
            SELECT new com.lms.chatservice.dto.ConversationSummary(
                CASE WHEN m.senderId = :adminId THEN m.recipientId ELSE m.senderId END,
                SUM(CASE WHEN m.senderId <> :adminId AND m.isRead = false THEN 1 ELSE 0 END)
            )
            FROM ChatMessage m
            WHERE m.senderId = :adminId OR m.recipientId = :adminId
            GROUP BY CASE WHEN m.senderId = :adminId THEN m.recipientId ELSE m.senderId END
            """)
    List<ConversationSummary> findConversationsWithUnreadCount(@Param("adminId") Long adminId);

    @Modifying
    @Query("""
            UPDATE ChatMessage m
            SET m.isRead = true
            WHERE m.senderId = :fromUserId
              AND m.recipientId = :toAdminId
              AND m.isRead = false
            """)
    void markAsRead(@Param("fromUserId") Long fromUserId, @Param("toAdminId") Long toAdminId);
}