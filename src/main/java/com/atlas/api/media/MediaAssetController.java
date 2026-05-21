package com.atlas.api.media;

import com.atlas.api.auth.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaAssetController {

    private final MediaAssetRepository repository;

    public MediaAssetController(MediaAssetRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public MediaAssetResponse register(Authentication authentication, @Valid @RequestBody RegisterMediaRequest request) {
        MediaAsset asset = new MediaAsset(
            userId(authentication),
            request.type(),
            request.storageKey(),
            request.mimeType(),
            request.sizeBytes(),
            request.checksum()
        );
        return MediaAssetResponse.from(repository.save(asset));
    }

    private static UUID userId(Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return UUID.nameUUIDFromBytes(user.firebaseUid().getBytes(StandardCharsets.UTF_8));
    }
}
