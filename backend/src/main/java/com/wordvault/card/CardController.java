package com.wordvault.card;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService service;

    public CardController(CardService service) {
        this.service = service;
    }

    @GetMapping
    public List<CardDto.Response> list(@RequestParam(required = false) Long wordId) {
        List<Card> cards = wordId == null ? service.list() : service.listByWord(wordId);
        return cards.stream().map(CardDto.Response::from).toList();
    }

    @PostMapping("/{id}/reset")
    public CardDto.Response reset(@PathVariable Long id) {
        return CardDto.Response.from(service.reset(id));
    }

    @PostMapping("/batch-enabled")
    public List<CardDto.Response> batchEnabled(@RequestBody CardDto.BatchEnabledRequest req) {
        return service.batchSetEnabled(req.ids(), req.enabled()).stream()
                .map(CardDto.Response::from).toList();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
