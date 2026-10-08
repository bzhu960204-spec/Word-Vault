package com.wordvault.word;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "words", indexes = {
        @Index(name = "idx_word_text", columnList = "text")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String text;

    @Column(length = 1024)
    private String translation;

    @Column(length = 64)
    private String partOfSpeech;

    @Column(length = 2048)
    private String exampleEn;

    @Column(length = 2048)
    private String exampleCn;

    @Column(length = 2048)
    private String usageNote;

    /** Comma-separated tags, e.g. "toefl,verb,daily" */
    @Column(length = 512)
    private String tags;

    /** Where this word was encountered, e.g. "GRE词汇书", "经济学人2024-01" */
    @Column(length = 512)
    private String source;

    @Builder.Default
    @Column(nullable = false)
    private Integer familiarity = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
