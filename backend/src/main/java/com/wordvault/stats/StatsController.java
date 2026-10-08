package com.wordvault.stats;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService service;

    public StatsController(StatsService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public StatsDto.Summary summary() {
        return service.summary();
    }

    @GetMapping("/daily")
    public StatsDto.Daily daily(@RequestParam(defaultValue = "30") int days) {
        return service.daily(days);
    }
}
