package com.atlas.api.analysis;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, UUID> {

    Optional<AnalysisJob> findFirstByObservationRecordIdOrderByCreatedAtDesc(UUID observationRecordId);
}
