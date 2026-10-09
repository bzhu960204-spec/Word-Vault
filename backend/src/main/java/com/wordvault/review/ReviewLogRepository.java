package com.wordvault.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

public interface ReviewLogRepository extends JpaRepository<ReviewLog, Long> {

    long countByReviewedAtBetween(Instant from, Instant to);

    List<ReviewLog> findByReviewedAtGreaterThanEqualOrderByReviewedAtAsc(Instant from);

    @Modifying
    @Query("DELETE FROM ReviewLog r WHERE r.cardId = :cardId")
    void deleteByCardId(@Param("cardId") Long cardId);

    @Modifying
    @Query("DELETE FROM ReviewLog r WHERE r.cardId IN :cardIds")
    void deleteByCardIdIn(@Param("cardIds") Collection<Long> cardIds);
}
