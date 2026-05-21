package com.atlas.api.analysis;

import com.atlas.api.observation.ObservationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/analysis-jobs")
public class AnalysisController {

    private final ObservationService observationService;

    public AnalysisController(ObservationService observationService) {
        this.observationService = observationService;
    }

    @GetMapping("/{id}")
    public AnalysisResponse get(@PathVariable UUID id) {
        return observationService.getAnalysis(id);
    }
}
