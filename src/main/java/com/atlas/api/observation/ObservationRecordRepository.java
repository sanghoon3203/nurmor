package com.atlas.api.observation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ObservationRecordRepository extends JpaRepository<ObservationRecord, UUID> {

    long countByHabitatCellIdAndStatus(UUID habitatCellId, ObservationStatus status);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, ObservationStatus status);

    List<ObservationRecord> findTop10ByUserIdOrderByCapturedAtDesc(UUID userId);

    List<ObservationRecord> findByUserIdAndStatus(UUID userId, ObservationStatus status);

    List<ObservationRecord> findByHabitatCellIdAndStatus(UUID habitatCellId, ObservationStatus status);

    @Query("""
        select count(distinct o.userId)
        from ObservationRecord o
        where o.habitatCellId = :habitatCellId and o.status = :status
        """)
    long countDistinctUsersByHabitatCellIdAndStatus(
        @Param("habitatCellId") UUID habitatCellId,
        @Param("status") ObservationStatus status
    );

    @Query("""
        select count(distinct o.selectedSpeciesCandidateId)
        from ObservationRecord o
        where o.userId = :userId
          and o.status = :status
          and o.selectedSpeciesCandidateId is not null
        """)
    long countDistinctSelectedSpeciesByUserIdAndStatus(
        @Param("userId") UUID userId,
        @Param("status") ObservationStatus status
    );

    @Query("""
        select o
        from ObservationRecord o
        where o.status = :status
          and o.visibility <> :excludedVisibility
          and o.publicLat between :minLat and :maxLat
          and o.publicLng between :minLng and :maxLng
        order by o.capturedAt desc
        """)
    List<ObservationRecord> findPublicDiscoveries(
        @Param("status") ObservationStatus status,
        @Param("excludedVisibility") Visibility excludedVisibility,
        @Param("minLat") double minLat,
        @Param("maxLat") double maxLat,
        @Param("minLng") double minLng,
        @Param("maxLng") double maxLng
    );
}
