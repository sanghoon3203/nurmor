package com.atlas.api.codex;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/codex")
public class GlobalCodexController {

    private static final int MAX_PAGE_SIZE = 50;

    private final CodexEntryRepository repository;

    public GlobalCodexController(CodexEntryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public CodexListResponse list(
        @RequestParam(required = false) CodexCategory category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "lastObservedAt"));
        Page<CodexEntry> entries = category == null
            ? repository.findAllByOrderByLastObservedAtDesc(pageable)
            : repository.findByCategoryOrderByLastObservedAtDesc(category, pageable);
        return new CodexListResponse(
            entries.stream().map(CodexEntryResponse::from).toList(),
            safePage,
            safeSize,
            entries.getTotalElements()
        );
    }
}
