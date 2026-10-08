package com.wordvault.word;

import com.wordvault.card.CardDto;
import com.wordvault.card.CardService;
import com.wordvault.card.CardType;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/words")
public class WordController {

    private final WordService service;
    private final CardService cardService;

    public WordController(WordService service, CardService cardService) {
        this.service = service;
        this.cardService = cardService;
    }

    @GetMapping
    public List<WordDto.Response> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Integer familiarity
    ) {
        return service.list(q, tag, familiarity).stream()
                .map(WordDto.Response::from)
                .toList();
    }

    @GetMapping("/tags")
    public List<String> tags() {
        return service.allTags();
    }

    @GetMapping("/{id}")
    public WordDto.Response get(@PathVariable Long id) {
        return WordDto.Response.from(service.get(id));
    }

    @PostMapping
    public ResponseEntity<WordDto.Response> create(@Valid @RequestBody WordDto.Request req) {
        Word w = service.create(req);
        return ResponseEntity.created(URI.create("/api/words/" + w.getId()))
                .body(WordDto.Response.from(w));
    }

    @PostMapping("/import")
    public List<WordDto.Response> importWords(@RequestBody List<WordDto.Request> batch) {
        return batch.stream()
                .map(service::create)
                .map(WordDto.Response::from)
                .toList();
    }

    @PutMapping("/{id}")
    public WordDto.Response update(@PathVariable Long id, @Valid @RequestBody WordDto.Request req) {
        return WordDto.Response.from(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cards")
    public CardDto.Response createCard(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        CardType type = CardType.EN_TO_CN;
        if (body != null && body.get("type") != null) {
            type = CardType.valueOf(body.get("type"));
        }
        return CardDto.Response.from(cardService.createForWord(id, type));
    }
}
