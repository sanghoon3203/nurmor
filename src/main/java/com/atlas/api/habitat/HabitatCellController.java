package com.atlas.api.habitat;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habitat-cells")
public class HabitatCellController {

    private final HabitatCellService service;

    public HabitatCellController(HabitatCellService service) {
        this.service = service;
    }

    @GetMapping("/nearby")
    public List<HabitatCellResponse> nearby(
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lng,
        @RequestParam(defaultValue = "5") double radiusKm
    ) {
        List<HabitatCell> cells = lat == null || lng == null
            ? service.nearby()
            : service.nearby(lat, lng, radiusKm);
        return cells.stream().map(HabitatCellResponse::from).toList();
    }

    @GetMapping("/{id}")
    public HabitatCellResponse get(@PathVariable UUID id) {
        return HabitatCellResponse.from(service.get(id));
    }

    @GetMapping("/{id}/report")
    public HabitatCellReportResponse report(@PathVariable UUID id) {
        return service.report(id);
    }
}
