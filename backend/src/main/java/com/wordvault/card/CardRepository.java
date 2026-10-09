package com.wordvault.card;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    Optional<Card> findByWordIdAndType(Long wordId, CardType type);
    List<Card> findByWordId(Long wordId);

    @Query("SELECT c FROM Card c JOIN FETCH c.word WHERE c.dueDate <= :date ORDER BY c.dueDate ASC")
    List<Card> findDueCards(@Param("date") LocalDate date);

    long countByDueDateLessThanEqual(LocalDate date);

    @Modifying
    @Query("DELETE FROM Card c WHERE c.word.id = :wordId")
    void deleteByWordId(@Param("wordId") Long wordId);

    @Modifying
    @Query("DELETE FROM Card c WHERE c.word.id IN :wordIds")
    void deleteByWordIdIn(@Param("wordIds") java.util.Collection<Long> wordIds);

    @Query("SELECT c.id FROM Card c WHERE c.word.id = :wordId")
    List<Long> findIdsByWordId(@Param("wordId") Long wordId);

    @Query("SELECT c.id FROM Card c WHERE c.word.id IN :wordIds")
    List<Long> findIdsByWordIdIn(@Param("wordIds") java.util.Collection<Long> wordIds);

    @Query("SELECT c FROM Card c JOIN FETCH c.word")
    List<Card> findAllWithWord();

    @Query("SELECT c FROM Card c JOIN FETCH c.word WHERE c.word.id = :wordId")
    List<Card> findByWordIdWithWord(@Param("wordId") Long wordId);

    @Query("SELECT c FROM Card c JOIN FETCH c.word w WHERE LOWER(w.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    List<Card> findByWordTag(@Param("tag") String tag);

    @Query("SELECT c FROM Card c JOIN FETCH c.word WHERE c.id IN :ids")
    List<Card> findByIdInWithWord(@Param("ids") List<Long> ids);

    @Query("SELECT DISTINCT c.word.id FROM Card c")
    List<Long> findAllWordIds();
}
