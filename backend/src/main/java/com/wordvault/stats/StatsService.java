package com.wordvault.stats;

import com.wordvault.card.CardRepository;
import com.wordvault.review.ReviewLogRepository;
import com.wordvault.word.WordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final WordRepository wordRepository;
    private final CardRepository cardRepository;
    private final ReviewLogRepository logRepository;

    public StatsService(WordRepository wordRepository, CardRepository cardRepository, ReviewLogRepository logRepository) {
        this.wordRepository = wordRepository;
        this.cardRepository = cardRepository;
        this.logRepository = logRepository;
    }

    @Transactional(readOnly = true)
    public StatsDto.Summary summary() {
        LocalDate today = LocalDate.now();
        Instant startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        long reviewedToday = logRepository.countByReviewedAtBetween(startOfDay, endOfDay);
        long dueToday = cardRepository.countByDueDateLessThanEqual(today);

        return new StatsDto.Summary(
                wordRepository.count(),
                cardRepository.count(),
                dueToday,
                reviewedToday,
                computeStreak()
        );
    }

    @Transactional(readOnly = true)
    public StatsDto.Daily daily(int days) {
        int n = Math.max(1, Math.min(days, 365));
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(n - 1L);
        Instant fromInstant = from.atStartOfDay(ZoneId.systemDefault()).toInstant();

        Map<LocalDate, Long> counts = logRepository
                .findByReviewedAtGreaterThanEqualOrderByReviewedAtAsc(fromInstant)
                .stream()
                .collect(Collectors.groupingBy(
                        l -> l.getReviewedAt().atZone(ZoneId.systemDefault()).toLocalDate(),
                        Collectors.counting()
                ));

        List<StatsDto.DailyPoint> points = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            LocalDate d = from.plusDays(i);
            points.add(new StatsDto.DailyPoint(d.toString(), counts.getOrDefault(d, 0L)));
        }
        return new StatsDto.Daily(points);
    }

    private int computeStreak() {
        // Look back up to 365 days. Streak = consecutive days (ending today or yesterday) with at least one review.
        LocalDate today = LocalDate.now();
        Instant from = today.minusDays(364).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Set<LocalDate> reviewDays = logRepository
                .findByReviewedAtGreaterThanEqualOrderByReviewedAtAsc(from)
                .stream()
                .map(l -> l.getReviewedAt().atZone(ZoneId.systemDefault()).toLocalDate())
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate cursor = today;
        if (!reviewDays.contains(cursor)) {
            cursor = cursor.minusDays(1);
            if (!reviewDays.contains(cursor)) return 0;
        }
        while (reviewDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }
}
