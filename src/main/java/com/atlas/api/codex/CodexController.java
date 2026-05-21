package com.atlas.api.codex;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habitat-cells/{cellId}/codex")
public class CodexController {

    private final CodexEntryRepository repository;

    public CodexController(CodexEntryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<CodexEntryResponse> list(@PathVariable UUID cellId) {
        return repository.findByHabitatCellIdOrderByLastObservedAtDesc(cellId)
            .stream()
            .map(CodexEntryResponse::from)
            .toList();
    }
}
