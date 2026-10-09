package com.wordvault.word;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/words")
public class WordController {

    private final WordService service;

    public WordController(WordService service) {
        this.service = service;
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

    /** Returns the lower-cased texts (from the given list) that already exist, so the UI can flag duplicates. */
    @PostMapping("/import/preview")
    public Set<String> importPreview(@RequestBody List<String> texts) {
        return service.findExistingTexts(texts == null ? List.of() : texts);
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

    @PostMapping("/batch-delete")
    public ResponseEntity<Void> batchDelete(@RequestBody List<Long> ids) {
        service.deleteAll(ids);
        return ResponseEntity.noContent().build();
    }
}
