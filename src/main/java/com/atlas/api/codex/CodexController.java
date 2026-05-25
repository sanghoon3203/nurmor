package com.atlas.api.codex;

import com.atlas.api.habitat.HabitatCellRepository;
import com.atlas.api.habitat.HabitatCellView;
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
    private final HabitatCellRepository habitatCellRepository;

    public CodexController(CodexEntryRepository repository, HabitatCellRepository habitatCellRepository) {
        this.repository = repository;
        this.habitatCellRepository = habitatCellRepository;
    }

    @GetMapping
    public List<CodexEntryResponse> list(@PathVariable UUID cellId) {
        String regionName = habitatCellRepository.findById(cellId)
            .map(HabitatCellView::regionName)
            .orElse("현재 위치");
        return repository.findByHabitatCellIdOrderByLastObservedAtDesc(cellId)
            .stream()
            .map(entry -> CodexEntryResponse.from(entry, regionName))
            .toList();
    }
}
