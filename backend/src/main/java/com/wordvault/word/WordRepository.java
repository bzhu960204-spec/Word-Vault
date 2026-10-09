package com.wordvault.word;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface WordRepository extends JpaRepository<Word, Long>, JpaSpecificationExecutor<Word> {

    @Query("select lower(w.text) from Word w where lower(w.text) in :texts")
    List<String> findExistingTextsLower(@Param("texts") Collection<String> texts);
}
