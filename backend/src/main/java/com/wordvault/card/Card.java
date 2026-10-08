package com.wordvault.card;

import com.wordvault.word.Word;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "cards", uniqueConstraints = {
        @UniqueConstraint(name = "uk_card_word_type", columnNames = {"word_id", "type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CardType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CardState state;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private Integer intervalDays;

    @Column(nullable = false)
    private Double easeFactor;

    @Column(nullable = false)
    private Integer repetitions;

    @Column(nullable = false)
    private Integer lapses;

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    private Instant lastReviewedAt;
}
