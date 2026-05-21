package com.atlas.api.media;

import java.util.UUID;

public record MediaAssetResponse(
    UUID id,
    String type,
    String storageKey,
    String mimeType
) {
    static MediaAssetResponse from(MediaAsset asset) {
        return new MediaAssetResponse(asset.getId(), asset.getType().name(), asset.getStorageKey(), asset.getMimeType());
    }
}
