package com.wordvault.card;

import com.wordvault.common.NotFoundException;
import com.wordvault.word.Word;
import com.wordvault.word.WordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final WordRepository wordRepository;

    public CardService(CardRepository cardRepository, WordRepository wordRepository) {
        this.cardRepository = cardRepository;
        this.wordRepository = wordRepository;
    }

    @Transactional
    public Card createForWord(Long wordId, CardType type) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new NotFoundException("Word " + wordId + " not found"));
        return cardRepository.findByWordIdAndType(wordId, type).orElseGet(() -> {
            Card c = Card.builder()
                    .word(word)
                    .type(type)
                    .state(CardState.NEW)
                    .dueDate(LocalDate.now())
                    .intervalDays(0)
                    .easeFactor(2.5)
                    .repetitions(0)
                    .lapses(0)
                    .build();
            return cardRepository.save(c);
        });
    }

    @Transactional(readOnly = true)
    public List<Card> list() {
        return cardRepository.findAllWithWord();
    }

    @Transactional(readOnly = true)
    public List<Card> listByWord(Long wordId) {
        return cardRepository.findByWordIdWithWord(wordId);
    }

    @Transactional
    public void delete(Long id) {
        if (!cardRepository.existsById(id)) {
            throw new NotFoundException("Card " + id + " not found");
        }
        cardRepository.deleteById(id);
    }

    @Transactional
    public Card reset(Long id) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Card " + id + " not found"));
        card.setState(CardState.NEW);
        card.setIntervalDays(0);
        card.setEaseFactor(2.5);
        card.setRepetitions(0);
        card.setLapses(0);
        card.setDueDate(java.time.LocalDate.now());
        card.setLastReviewedAt(null);
        return cardRepository.save(card);
    }

    @Transactional
    public void deleteByWord(Long wordId) {
        cardRepository.deleteByWordId(wordId);
    }

    @Transactional
    public List<Card> batchSetEnabled(List<Long> ids, boolean enabled) {
        List<Card> cards = cardRepository.findByIdInWithWord(ids);
        cards.forEach(c -> c.setEnabled(enabled));
        return cardRepository.saveAll(cards);
    }
}
