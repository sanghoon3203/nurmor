package com.atlas.api.codex;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CodexEntryRepository extends JpaRepository<CodexEntry, UUID> {

    Optional<CodexEntry> findByHabitatCellIdAndSpeciesKey(UUID habitatCellId, String speciesKey);

    List<CodexEntry> findByHabitatCellIdOrderByLastObservedAtDesc(UUID habitatCellId);

    long countByHabitatCellId(UUID habitatCellId);
}
