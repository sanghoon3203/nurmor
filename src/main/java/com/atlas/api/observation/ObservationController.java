package com.atlas.api.observation;

import com.atlas.api.analysis.AnalysisResponse;
import com.atlas.api.auth.AuthenticatedUser;
import com.atlas.api.habitat.HabitatCellResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.UUID;

@RestController
@RequestMapping("/api/observations")
public class ObservationController {

    private final ObservationService service;

    public ObservationController(ObservationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ObservationResponse create(Authentication authentication, @Valid @RequestBody CreateObservationRequest request) {
        return ObservationResponse.from(service.create(userId(authentication), request));
    }

    @PostMapping("/{id}/analyze")
    public AnalysisResponse analyze(@PathVariable UUID id) {
        return service.analyze(id);
    }

    @PostMapping("/{id}/plant")
    public HabitatCellResponse plant(@PathVariable UUID id, @Valid @RequestBody PlantObservationRequest request) {
        return HabitatCellResponse.from(service.plant(id, request));
    }

    @GetMapping("/analysis-jobs/{id}")
    public AnalysisResponse analysis(@PathVariable UUID id) {
        return service.getAnalysis(id);
    }

    private static UUID userId(Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return UUID.nameUUIDFromBytes(user.firebaseUid().getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
