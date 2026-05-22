package com.atlas.api.profile;

import com.atlas.api.auth.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/me")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public UserProfileResponse get(Authentication authentication) {
        return profileService.get(user(authentication));
    }

    @PutMapping
    public UserProfileResponse update(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return profileService.update(user(authentication), request);
    }

    @GetMapping("/stats")
    public UserStatsResponse stats(Authentication authentication) {
        return profileService.stats(user(authentication));
    }

    @GetMapping("/recent-observations")
    public List<RecentObservationResponse> recentObservations(Authentication authentication) {
        return profileService.recentObservations(user(authentication));
    }

    private static AuthenticatedUser user(Authentication authentication) {
        return (AuthenticatedUser) authentication.getPrincipal();
    }
}
