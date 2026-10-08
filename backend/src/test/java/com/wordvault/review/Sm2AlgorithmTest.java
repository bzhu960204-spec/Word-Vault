package com.wordvault.review;

import com.wordvault.card.Card;
import com.wordvault.card.CardState;
import com.wordvault.card.CardType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class Sm2AlgorithmTest {

    private Card newCard() {
        return Card.builder()
                .type(CardType.EN_TO_CN)
                .state(CardState.NEW)
                .dueDate(LocalDate.now())
                .intervalDays(0)
                .easeFactor(2.5)
                .repetitions(0)
                .lapses(0)
                .build();
    }

    @Test
    void goodOnNewCardSetsOneDayInterval() {
        Card c = newCard();
        Sm2Algorithm.apply(c, ReviewRating.GOOD);
        assertThat(c.getIntervalDays()).isEqualTo(1);
        assertThat(c.getRepetitions()).isEqualTo(1);
        assertThat(c.getDueDate()).isEqualTo(LocalDate.now().plusDays(1));
    }

    @Test
    void secondGoodSetsSixDays() {
        Card c = newCard();
        Sm2Algorithm.apply(c, ReviewRating.GOOD);
        Sm2Algorithm.apply(c, ReviewRating.GOOD);
        assertThat(c.getIntervalDays()).isEqualTo(6);
        assertThat(c.getRepetitions()).isEqualTo(2);
        assertThat(c.getState()).isEqualTo(CardState.REVIEW);
    }

    @Test
    void thirdGoodUsesEaseFactor() {
        Card c = newCard();
        Sm2Algorithm.apply(c, ReviewRating.GOOD);
        Sm2Algorithm.apply(c, ReviewRating.GOOD);
        Sm2Algorithm.apply(c, ReviewRating.GOOD);
        // 6 * 2.5 = 15
        assertThat(c.getIntervalDays()).isEqualTo(15);
    }

    @Test
    void againResetsRepsAndIncreasesLapses() {
        Card c = newCard();
        Sm2Algorithm.apply(c, ReviewRating.GOOD);
        Sm2Algorithm.apply(c, ReviewRating.GOOD);
        Sm2Algorithm.apply(c, ReviewRating.AGAIN);
        assertThat(c.getRepetitions()).isZero();
        assertThat(c.getLapses()).isEqualTo(1);
        assertThat(c.getIntervalDays()).isEqualTo(1);
        assertThat(c.getEaseFactor()).isLessThan(2.5);
        assertThat(c.getState()).isEqualTo(CardState.LEARNING);
    }

    @Test
    void easeFactorHasMinimum() {
        Card c = newCard();
        c.setEaseFactor(1.4);
        Sm2Algorithm.apply(c, ReviewRating.AGAIN);
        assertThat(c.getEaseFactor()).isGreaterThanOrEqualTo(1.3);
    }

    @Test
    void easyIncreasesEaseFactor() {
        Card c = newCard();
        double before = c.getEaseFactor();
        Sm2Algorithm.apply(c, ReviewRating.EASY);
        assertThat(c.getEaseFactor()).isGreaterThan(before);
        assertThat(c.getState()).isEqualTo(CardState.REVIEW);
    }
}
