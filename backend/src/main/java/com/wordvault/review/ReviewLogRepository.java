package com.wordvault.review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

public interface ReviewLogRepository extends JpaRepository<ReviewLog, Long> {

    long countByReviewedAtBetween(Instant from, Instant to);

    List<ReviewLog> findByReviewedAtGreaterThanEqualOrderByReviewedAtAsc(Instant from);

    void deleteByCardId(Long cardId);

    void deleteByCardIdIn(Collection<Long> cardIds);
}
