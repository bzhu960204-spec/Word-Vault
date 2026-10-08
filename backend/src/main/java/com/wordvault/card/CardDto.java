package com.wordvault.card;

import com.wordvault.word.Word;

import java.util.List;

public class CardDto {

    public record Response(
            Long id,
            Long wordId,
            String wordText,
            String translation,
            String partOfSpeech,
            String exampleEn,
            String exampleCn,
            String usageNote,
            String tags,
            CardType type,
            CardState state,
            Boolean enabled,
            String dueDate,
            Integer intervalDays,
            Double easeFactor,
            Integer repetitions,
            Integer lapses,
            String lastReviewedAt
    ) {
        public static Response from(Card c) {
            Word w = c.getWord();
            return new Response(
                    c.getId(),
                    w == null ? null : w.getId(),
                    w == null ? null : w.getText(),
                    w == null ? null : w.getTranslation(),
                    w == null ? null : w.getPartOfSpeech(),
                    w == null ? null : w.getExampleEn(),
                    w == null ? null : w.getExampleCn(),
                    w == null ? null : w.getUsageNote(),
                    w == null ? null : w.getTags(),
                    c.getType(),
                    c.getState(),
                    c.getEnabled(),
                    c.getDueDate() == null ? null : c.getDueDate().toString(),
                    c.getIntervalDays(),
                    c.getEaseFactor(),
                    c.getRepetitions(),
                    c.getLapses(),
                    c.getLastReviewedAt() == null ? null : c.getLastReviewedAt().toString()
            );
        }
    }

    public record BatchEnabledRequest(List<Long> ids, Boolean enabled) {}
}
