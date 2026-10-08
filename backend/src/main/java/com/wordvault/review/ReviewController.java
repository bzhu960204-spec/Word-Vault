package com.wordvault.review;

import com.wordvault.card.CardDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping("/due")
    public List<CardDto.Response> due() {
        return service.dueToday();
    }

    @GetMapping("/practice")
    public List<CardDto.Response> practice(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Integer limit
    ) {
        return service.practiceCards(tag, limit);
    }

    @PostMapping("/{cardId}")
    public Map<String, Object> submit(@PathVariable Long cardId, @RequestBody Map<String, String> body) {
        ReviewRating rating = ReviewRating.valueOf(body.get("rating"));
        return service.submit(cardId, rating);
    }
}
