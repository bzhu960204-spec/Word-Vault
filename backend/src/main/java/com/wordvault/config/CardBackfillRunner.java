package com.wordvault.config;

import com.wordvault.card.CardRepository;
import com.wordvault.card.CardService;
import com.wordvault.card.CardType;
import com.wordvault.word.Word;
import com.wordvault.word.WordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/** Ensures every existing word has a practice card, so the card pool reflects the whole library. */
@Component
@Order(100)
public class CardBackfillRunner implements CommandLineRunner {

    private final WordRepository wordRepository;
    private final CardRepository cardRepository;
    private final CardService cardService;

    public CardBackfillRunner(WordRepository wordRepository,
                              CardRepository cardRepository,
                              CardService cardService) {
        this.wordRepository = wordRepository;
        this.cardRepository = cardRepository;
        this.cardService = cardService;
    }

    @Override
    public void run(String... args) {
        Set<Long> wordIdsWithCards = new HashSet<>(cardRepository.findAllWordIds());
        for (Word word : wordRepository.findAll()) {
            if (!wordIdsWithCards.contains(word.getId())) {
                cardService.createForWord(word.getId(), CardType.EN_TO_CN);
            }
        }
    }
}
