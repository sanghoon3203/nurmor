package com.atlas.api.codex;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CodexEntryRepository extends JpaRepository<CodexEntry, UUID> {

    Optional<CodexEntry> findByHabitatCellIdAndSpeciesKey(UUID habitatCellId, String speciesKey);

    List<CodexEntry> findByHabitatCellIdOrderByLastObservedAtDesc(UUID habitatCellId);

    Page<CodexEntry> findAllByOrderByLastObservedAtDesc(Pageable pageable);

    Page<CodexEntry> findByCategoryOrderByLastObservedAtDesc(CodexCategory category, Pageable pageable);

    long countByHabitatCellId(UUID habitatCellId);
}
