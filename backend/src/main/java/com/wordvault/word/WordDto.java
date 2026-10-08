package com.wordvault.word;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class WordDto {

    public record Request(
            @NotBlank String text,
            String translation,
            String partOfSpeech,
            String exampleEn,
            String exampleCn,
            String usageNote,
            String tags,
            String source,
            @Min(0) @Max(5) Integer familiarity
    ) {}

    public record Response(
            Long id,
            String text,
            String translation,
            String partOfSpeech,
            String exampleEn,
            String exampleCn,
            String usageNote,
            String tags,
            String source,
            Integer familiarity,
            String createdAt,
            String updatedAt
    ) {
        public static Response from(Word w) {
            return new Response(
                    w.getId(),
                    w.getText(),
                    w.getTranslation(),
                    w.getPartOfSpeech(),
                    w.getExampleEn(),
                    w.getExampleCn(),
                    w.getUsageNote(),
                    w.getTags(),
                    w.getSource(),
                    w.getFamiliarity(),
                    w.getCreatedAt() == null ? null : w.getCreatedAt().toString(),
                    w.getUpdatedAt() == null ? null : w.getUpdatedAt().toString()
            );
        }
    }
}
