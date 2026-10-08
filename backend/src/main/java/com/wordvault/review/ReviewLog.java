package com.wordvault.review;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "review_logs", indexes = {
        @Index(name = "idx_log_reviewed_at", columnList = "reviewedAt"),
        @Index(name = "idx_log_card_id", columnList = "cardId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long cardId;

    @Column(nullable = false)
    private Instant reviewedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ReviewRating rating;

    private Integer prevIntervalDays;
    private Integer nextIntervalDays;
}
