package com.atlas.api.media;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;


public record RegisterMediaRequest(
    @jakarta.validation.constraints.NotNull MediaType type,
    @NotBlank String storageKey,
    @NotBlank String mimeType,
    @PositiveOrZero long sizeBytes,
    @NotBlank String checksum
) {
}
