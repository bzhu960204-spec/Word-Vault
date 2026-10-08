package com.wordvault.stats;

import java.util.List;

public class StatsDto {

    public record Summary(
            long totalWords,
            long totalCards,
            long dueToday,
            long reviewedToday,
            int streakDays
    ) {}

    public record DailyPoint(String date, long count) {}

    public record Daily(List<DailyPoint> points) {}
}
