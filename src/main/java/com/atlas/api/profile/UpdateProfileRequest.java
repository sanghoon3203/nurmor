package com.atlas.api.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank
    @Size(max = 80)
    String displayName,

    @Size(max = 500)
    String avatarUrl,

    boolean publicContributor
) {
}
