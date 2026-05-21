package com.atlas.api.analysis;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpeciesCandidateRepository extends JpaRepository<SpeciesCandidate, UUID> {

    List<SpeciesCandidate> findByAnalysisJobId(UUID analysisJobId);
}
