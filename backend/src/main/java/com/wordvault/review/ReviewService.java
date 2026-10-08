package com.wordvault.review;

import com.wordvault.card.Card;
import com.wordvault.card.CardDto;
import com.wordvault.card.CardRepository;
import com.wordvault.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final CardRepository cardRepository;
    private final ReviewLogRepository logRepository;

    public ReviewService(CardRepository cardRepository, ReviewLogRepository logRepository) {
        this.cardRepository = cardRepository;
        this.logRepository = logRepository;
    }

    @Transactional(readOnly = true)
    public List<CardDto.Response> dueToday() {
        return cardRepository.findDueCards(LocalDate.now()).stream()
                .map(CardDto.Response::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CardDto.Response> practiceCards(String tag, Integer limit) {
        List<Card> all;
        if (tag != null && !tag.isBlank()) {
            all = cardRepository.findByWordTag(tag);
        } else {
            all = cardRepository.findAllWithWord();
        }
        // Only include enabled cards for practice
        all = all.stream().filter(c -> Boolean.TRUE.equals(c.getEnabled())).toList();
        all = new java.util.ArrayList<>(all);
        java.util.Collections.shuffle(all);
        if (limit != null && limit > 0 && limit < all.size()) {
            all = all.subList(0, limit);
        }
        return all.stream().map(CardDto.Response::from).toList();
    }

    @Transactional
    public Map<String, Object> submit(Long cardId, ReviewRating rating) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card " + cardId + " not found"));
        int prevInterval = Sm2Algorithm.apply(card, rating);
        cardRepository.save(card);

        ReviewLog log = ReviewLog.builder()
                .cardId(card.getId())
                .reviewedAt(Instant.now())
                .rating(rating)
                .prevIntervalDays(prevInterval)
                .nextIntervalDays(card.getIntervalDays())
                .build();
        logRepository.save(log);

        return Map.of(
                "cardId", card.getId(),
                "nextDueDate", card.getDueDate().toString(),
                "intervalDays", card.getIntervalDays(),
                "easeFactor", card.getEaseFactor(),
                "state", card.getState()
        );
    }
}
