package com.atlas.api.codex;

import java.util.List;

public record CodexListResponse(
    List<CodexEntryResponse> items,
    int page,
    int size,
    long totalItems
) {
}
