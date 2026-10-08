package com.wordvault.word;

import com.wordvault.card.CardRepository;
import com.wordvault.common.NotFoundException;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class WordService {

    private final WordRepository repository;
    private final CardRepository cardRepository;

    public WordService(WordRepository repository, CardRepository cardRepository) {
        this.repository = repository;
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public List<Word> list(String q, String tag, Integer familiarity) {
        Specification<Word> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("text")), like),
                        cb.like(cb.lower(root.get("translation")), like)
                ));
            }
            if (tag != null && !tag.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("tags")), "%" + tag.toLowerCase() + "%"));
            }
            if (familiarity != null) {
                predicates.add(cb.equal(root.get("familiarity"), familiarity));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "updatedAt"));
    }

    @Transactional(readOnly = true)
    public Word get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Word " + id + " not found"));
    }

    @Transactional
    public Word create(WordDto.Request req) {
        Word w = Word.builder()
                .text(req.text().trim())
                .translation(req.translation())
                .partOfSpeech(req.partOfSpeech())
                .exampleEn(req.exampleEn())
                .exampleCn(req.exampleCn())
                .usageNote(req.usageNote())
                .tags(normalizeTags(req.tags()))
                .source(req.source())
                .familiarity(req.familiarity() == null ? 0 : req.familiarity())
                .build();
        return repository.save(w);
    }

    @Transactional
    public Word update(Long id, WordDto.Request req) {
        Word w = get(id);
        w.setText(req.text().trim());
        w.setTranslation(req.translation());
        w.setPartOfSpeech(req.partOfSpeech());
        w.setExampleEn(req.exampleEn());
        w.setExampleCn(req.exampleCn());
        w.setUsageNote(req.usageNote());
        w.setTags(normalizeTags(req.tags()));
        w.setSource(req.source());
        if (req.familiarity() != null) w.setFamiliarity(req.familiarity());
        return repository.save(w);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Word " + id + " not found");
        }
        cardRepository.deleteByWordId(id);
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<String> allTags() {
        return repository.findAll().stream()
                .map(Word::getTags)
                .filter(Objects::nonNull)
                .flatMap(t -> Arrays.stream(t.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    private String normalizeTags(String raw) {
        if (raw == null || raw.isBlank()) return null;
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.joining(","));
    }
}
