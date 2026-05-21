package com.atlas.api.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private final FirebaseTokenVerifier verifier;

    public FirebaseAuthenticationFilter(FirebaseTokenVerifier verifier) {
        this.verifier = verifier;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/actuator/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "missing bearer token");
            return;
        }

        String token = authorization.substring("Bearer ".length()).trim();
        try {
            AuthenticatedUser user = verifier.verify(token);
            SecurityContextHolder.getContext().setAuthentication(new AtlasAuthentication(user));
            filterChain.doFilter(request, response);
        } catch (FirebaseAuthException exception) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "invalid bearer token");
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
