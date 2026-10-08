package com.wordvault.word;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface WordRepository extends JpaRepository<Word, Long>, JpaSpecificationExecutor<Word> {
}
