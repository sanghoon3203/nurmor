package com.atlas.api.mobile;

import com.atlas.api.media.MediaType;
import com.atlas.api.media.RegisterMediaRequest;
import com.atlas.api.observation.CreateObservationRequest;
import com.atlas.api.observation.PlantObservationRequest;
import com.atlas.api.observation.Visibility;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MobileBackendContractIntegrationTest {

    @Autowired
    TestRestTemplate restTemplate;

    @Test
    void returnsAndUpdatesAuthenticatedUserProfile() {
        ResponseEntity<Map> initial = restTemplate.exchange(
            "/api/me",
            HttpMethod.GET,
            request("mobile-profile-user"),
            Map.class
        );

        assertThat(initial.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(initial.getBody()).containsEntry("displayName", "Local User");
        assertThat(initial.getBody()).containsEntry("publicContributor", false);

        ResponseEntity<Map> updated = restTemplate.exchange(
            "/api/me",
            HttpMethod.PUT,
            new HttpEntity<>(Map.of(
                "displayName", "서식지 탐험가",
                "avatarUrl", "https://example.com/avatar.png",
                "publicContributor", true
            ), headers("mobile-profile-user")),
            Map.class
        );

        assertThat(updated.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updated.getBody()).containsEntry("displayName", "서식지 탐험가");
        assertThat(updated.getBody()).containsEntry("avatarUrl", "https://example.com/avatar.png");
        assertThat(updated.getBody()).containsEntry("publicContributor", true);
    }

    @Test
    void exposesStatsRecentObservationsCodexAndCommunityForMobileViews() {
        SeededObservation seeded = seedPlantedObservation("mobile-feed-user");

        ResponseEntity<Map> stats = restTemplate.exchange(
            "/api/me/stats",
            HttpMethod.GET,
            request("mobile-feed-user"),
            Map.class
        );
        assertThat(stats.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(stats.getBody()).containsEntry("reportCount", 1);
        assertThat(stats.getBody()).containsEntry("discoveredSpeciesCount", 1);

        ResponseEntity<List> recent = restTemplate.exchange(
            "/api/me/recent-observations",
            HttpMethod.GET,
            request("mobile-feed-user"),
            List.class
        );
        assertThat(recent.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(recent.getBody()).hasSize(1);
        Map<?, ?> recentItem = (Map<?, ?>) recent.getBody().getFirst();
        assertThat(recentItem.containsKey("observationId")).isTrue();
        assertThat(recentItem.containsKey("displayName")).isTrue();
        assertThat(recentItem.containsKey("publicLat")).isTrue();
        assertThat(recentItem.containsKey("publicLng")).isTrue();

        ResponseEntity<List> cells = restTemplate.exchange(
            "/api/habitat-cells/nearby?lat=37.5665&lng=126.9780&radiusKm=5",
            HttpMethod.GET,
            request("mobile-feed-user"),
            List.class
        );
        assertThat(cells.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(cells.getBody()).anySatisfy(cell ->
            assertThat(((Map<?, ?>) cell).get("id")).isEqualTo(seeded.habitatCellId().toString())
        );
        Map<?, ?> cellItem = (Map<?, ?>) cells.getBody().stream()
            .filter(cell -> seeded.habitatCellId().toString().equals(((Map<?, ?>) cell).get("id")))
            .findFirst()
            .orElseThrow();
        assertThat(cellItem).containsKeys("regionName", "description", "habitatTypes", "boundaryCoordinates");

        ResponseEntity<Map> codex = restTemplate.exchange(
            "/api/codex?category=ANIMAL&page=0&size=20",
            HttpMethod.GET,
            request("mobile-feed-user"),
            Map.class
        );
        assertThat(codex.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(codex.getBody()).containsKeys("items", "page", "size", "totalItems");
        assertThat((List<?>) codex.getBody().get("items")).isNotEmpty();

        ResponseEntity<List> community = restTemplate.exchange(
            "/api/community/discoveries?lat=37.5665&lng=126.9780&radiusKm=5",
            HttpMethod.GET,
            request("mobile-feed-user"),
            List.class
        );
        assertThat(community.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(community.getBody()).hasSize(1);
        Map<?, ?> communityItem = (Map<?, ?>) community.getBody().getFirst();
        assertThat(communityItem.containsKey("discoveryId")).isTrue();
        assertThat(communityItem.containsKey("displayName")).isTrue();
        assertThat(communityItem.containsKey("distanceKm")).isTrue();
        assertThat(communityItem.containsKey("likeCount")).isTrue();
        assertThat(communityItem.containsKey("commentCount")).isTrue();
        assertThat(communityItem).containsKeys("codexNumber", "displayGroup", "imageUrl", "regionName");

        ResponseEntity<List> mapDiscoveries = restTemplate.exchange(
            "/api/map/discoveries?lat=37.5665&lng=126.9780&radiusKm=5",
            HttpMethod.GET,
            request("mobile-feed-user"),
            List.class
        );
        assertThat(mapDiscoveries.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(mapDiscoveries.getBody()).hasSize(1);
        assertThat((Map<?, ?>) mapDiscoveries.getBody().getFirst()).containsKeys(
            "publicLat",
            "publicLng",
            "codexNumber",
            "displayName",
            "capturedAt",
            "contributorName",
            "displayGroup"
        );

        ResponseEntity<Map> report = restTemplate.exchange(
            "/api/habitat-cells/%s/report".formatted(seeded.habitatCellId()),
            HttpMethod.GET,
            request("mobile-feed-user"),
            Map.class
        );
        assertThat(report.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(report.getBody()).containsKeys(
            "habitatCellId",
            "regionName",
            "summary",
            "terrainDescription",
            "featuredSpecies",
            "representativeImages",
            "recentDiscoveries"
        );
        assertThat((List<?>) report.getBody().get("featuredSpecies")).isNotEmpty();
    }

    private SeededObservation seedPlantedObservation(String token) {
        ResponseEntity<Map> media = restTemplate.exchange(
            "/api/media/register",
            HttpMethod.POST,
            new HttpEntity<>(new RegisterMediaRequest(
                MediaType.PHOTO,
                "firebase://atlas/users/%s/observations/sample.jpg".formatted(token),
                "image/jpeg",
                2048,
                "checksum-mobile"
            ), headers(token)),
            Map.class
        );
        assertThat(media.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID mediaId = UUID.fromString((String) media.getBody().get("id"));

        ResponseEntity<Map> observation = restTemplate.exchange(
            "/api/observations",
            HttpMethod.POST,
            new HttpEntity<>(new CreateObservationRequest(
                List.of(mediaId),
                37.5665,
                126.9780,
                8.0,
                Instant.parse("2026-05-21T02:30:00Z")
            ), headers(token)),
            Map.class
        );
        assertThat(observation.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID observationId = UUID.fromString((String) observation.getBody().get("id"));
        UUID habitatCellId = UUID.fromString((String) observation.getBody().get("habitatCellId"));

        ResponseEntity<Map> analysis = restTemplate.exchange(
            "/api/observations/%s/analyze".formatted(observationId),
            HttpMethod.POST,
            request(token),
            Map.class
        );
        assertThat(analysis.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<?> candidates = (List<?>) analysis.getBody().get("candidates");
        UUID candidateId = UUID.fromString((String) ((Map<?, ?>) candidates.getFirst()).get("id"));

        ResponseEntity<Map> plant = restTemplate.exchange(
            "/api/observations/%s/plant".formatted(observationId),
            HttpMethod.POST,
            new HttpEntity<>(new PlantObservationRequest(candidateId, Visibility.CELL), headers(token)),
            Map.class
        );
        assertThat(plant.getStatusCode()).isEqualTo(HttpStatus.OK);

        return new SeededObservation(observationId, habitatCellId);
    }

    private static HttpHeaders headers(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        return headers;
    }

    private static HttpEntity<Void> request(String token) {
        return new HttpEntity<>(headers(token));
    }

    private record SeededObservation(UUID observationId, UUID habitatCellId) {
    }
}
