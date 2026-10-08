package com.wordvault.review;

import com.wordvault.card.Card;
import com.wordvault.card.CardState;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Simplified SM-2: mutates the card in-place and returns the previous interval (for logging).
 */
public final class Sm2Algorithm {

    private static final double MIN_EASE = 1.3;

    private Sm2Algorithm() {}

    public static int apply(Card card, ReviewRating rating) {
        int prevInterval = card.getIntervalDays() == null ? 0 : card.getIntervalDays();
        double ease = card.getEaseFactor() == null ? 2.5 : card.getEaseFactor();
        int reps = card.getRepetitions() == null ? 0 : card.getRepetitions();
        int lapses = card.getLapses() == null ? 0 : card.getLapses();
        int nextInterval;
        CardState nextState;

        switch (rating) {
            case AGAIN -> {
                ease = Math.max(MIN_EASE, ease - 0.2);
                reps = 0;
                lapses += 1;
                nextInterval = 1;
                nextState = CardState.LEARNING;
            }
            case HARD -> {
                ease = Math.max(MIN_EASE, ease - 0.15);
                nextInterval = Math.max(1, (int) Math.round(Math.max(prevInterval, 1) * 1.2));
                reps += 1;
                nextState = reps >= 2 ? CardState.REVIEW : CardState.LEARNING;
            }
            case GOOD -> {
                if (reps == 0) {
                    nextInterval = 1;
                } else if (reps == 1) {
                    nextInterval = 6;
                } else {
                    nextInterval = Math.max(1, (int) Math.round(prevInterval * ease));
                }
                reps += 1;
                nextState = reps >= 2 ? CardState.REVIEW : CardState.LEARNING;
            }
            case EASY -> {
                ease += 0.15;
                if (reps == 0) {
                    nextInterval = 4;
                } else {
                    nextInterval = Math.max(1, (int) Math.round(prevInterval * ease * 1.3));
                }
                reps += 1;
                nextState = CardState.REVIEW;
            }
            default -> throw new IllegalArgumentException("Unknown rating: " + rating);
        }

        card.setEaseFactor(ease);
        card.setRepetitions(reps);
        card.setLapses(lapses);
        card.setIntervalDays(nextInterval);
        card.setState(nextState);
        card.setDueDate(LocalDate.now().plusDays(nextInterval));
        card.setLastReviewedAt(Instant.now());

        return prevInterval;
    }
}
