package com.atlas.api.auth;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

public class AtlasAuthentication extends AbstractAuthenticationToken {

    private final AuthenticatedUser user;

    public AtlasAuthentication(AuthenticatedUser user) {
        super(List.of(new SimpleGrantedAuthority("ROLE_USER")));
        this.user = user;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public AuthenticatedUser getPrincipal() {
        return user;
    }
}
