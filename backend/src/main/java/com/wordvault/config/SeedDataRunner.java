package com.wordvault.config;

import com.wordvault.card.CardService;
import com.wordvault.card.CardType;
import com.wordvault.word.Word;
import com.wordvault.word.WordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SeedDataRunner implements CommandLineRunner {

    private final WordRepository wordRepository;
    private final CardService cardService;
    private final boolean enabled;

    public SeedDataRunner(WordRepository wordRepository,
                          CardService cardService,
                          @Value("${wordvault.seed-data:false}") boolean enabled) {
        this.wordRepository = wordRepository;
        this.cardService = cardService;
        this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled) return;
        if (wordRepository.count() > 0) return;

        List<Word> seeds = List.of(
                Word.builder()
                        .text("ubiquitous")
                        .translation("无处不在的；普遍存在的")
                        .partOfSpeech("adj.")
                        .exampleEn("Smartphones have become ubiquitous in modern life.")
                        .exampleCn("智能手机在现代生活中已变得无处不在。")
                        .usageNote("常用于科技与现代文化语境，正式书面用语。")
                        .tags("toefl,adj,daily")
                        .familiarity(1)
                        .build(),
                Word.builder()
                        .text("meticulous")
                        .translation("一丝不苟的；极细心的")
                        .partOfSpeech("adj.")
                        .exampleEn("She is meticulous about keeping her records up to date.")
                        .exampleCn("她对保持记录的更新一丝不苟。")
                        .usageNote("褒义，常修饰人或工作态度。")
                        .tags("gre,adj")
                        .familiarity(2)
                        .build(),
                Word.builder()
                        .text("elaborate")
                        .translation("详尽阐述；精心制作的")
                        .partOfSpeech("v./adj.")
                        .exampleEn("Could you elaborate on your proposal?")
                        .exampleCn("你能详细说明一下你的方案吗？")
                        .usageNote("作动词常搭配 on：elaborate on something。")
                        .tags("verb,daily")
                        .familiarity(0)
                        .build()
        );

        seeds.forEach(w -> {
            Word saved = wordRepository.save(w);
            cardService.createForWord(saved.getId(), CardType.EN_TO_CN);
        });
    }
}
