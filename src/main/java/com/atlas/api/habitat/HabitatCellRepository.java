package com.atlas.api.habitat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HabitatCellRepository extends JpaRepository<HabitatCell, UUID> {

    Optional<HabitatCell> findByCellKey(String cellKey);
}
