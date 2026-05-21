package com.atlas.api.auth;

import com.atlas.api.media.MediaType;
import com.atlas.api.media.RegisterMediaRequest;
import com.atlas.api.observation.CreateObservationRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthIntegrationTest {

    @Autowired
    TestRestTemplate restTemplate;

    @Test
    void rejectsApiRequestWithoutBearerToken() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/habitat-cells/nearby", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void acceptsApiRequestWithBearerToken() {
        HttpEntity<Void> request = new HttpEntity<>(headers());

        ResponseEntity<String> response = restTemplate.exchange(
            "/api/habitat-cells/nearby",
            HttpMethod.GET,
            request,
            String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void createsMediaAndObservationForAuthenticatedUser() {
        ResponseEntity<Map> mediaResponse = restTemplate.exchange(
            "/api/media/register",
            HttpMethod.POST,
            new HttpEntity<>(new RegisterMediaRequest(
                MediaType.PHOTO,
                "firebase://atlas/uploads/sample.jpg",
                "image/jpeg",
                1024,
                "checksum-1"
            ), headers()),
            Map.class
        );
        assertThat(mediaResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID mediaId = UUID.fromString((String) mediaResponse.getBody().get("id"));

        ResponseEntity<Map> observationResponse = restTemplate.exchange(
            "/api/observations",
            HttpMethod.POST,
            new HttpEntity<>(new CreateObservationRequest(
                List.of(mediaId),
                37.5665,
                126.9780,
                12.0,
                Instant.parse("2026-05-20T10:00:00Z")
            ), headers()),
            Map.class
        );

        assertThat(observationResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(observationResponse.getBody()).containsKeys("id", "habitatCellId", "publicLat", "publicLng");
    }

    private static HttpHeaders headers() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth("test-user");
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        return headers;
    }
}
