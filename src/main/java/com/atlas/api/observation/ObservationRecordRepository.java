package com.atlas.api.observation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ObservationRecordRepository extends JpaRepository<ObservationRecord, UUID> {

    long countByHabitatCellIdAndStatus(UUID habitatCellId, ObservationStatus status);

    List<ObservationRecord> findByHabitatCellIdAndStatus(UUID habitatCellId, ObservationStatus status);
}
