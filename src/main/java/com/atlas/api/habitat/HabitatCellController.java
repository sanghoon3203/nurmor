package com.atlas.api.habitat;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public List<HabitatCellResponse> nearby() {
        return service.nearby().stream().map(HabitatCellResponse::from).toList();
    }

    @GetMapping("/{id}")
    public HabitatCellResponse get(@PathVariable UUID id) {
        return HabitatCellResponse.from(service.get(id));
    }
}
