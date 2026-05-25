package com.atlas.api.map;

import com.atlas.api.community.CommunityDiscoveryResponse;
import com.atlas.api.community.CommunityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/map")
public class MapController {

    private final CommunityService communityService;

    public MapController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping("/discoveries")
    public List<CommunityDiscoveryResponse> discoveries(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(defaultValue = "5") double radiusKm
    ) {
        return communityService.discoveries(lat, lng, radiusKm);
    }
}
