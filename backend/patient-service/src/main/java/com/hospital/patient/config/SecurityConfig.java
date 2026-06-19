package com.hospital.patient.config;

import com.hospital.common.security.JwtTokenProvider;
import com.hospital.common.security.SecurityConstants;
import com.hospital.common.security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Security configuration for downstream services.
 * Trusts the API Gateway's X-User-* headers OR validates JWT directly.
 * This pattern is reusable across all business services.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayHeaderAuthFilter gatewayHeaderAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(gatewayHeaderAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * Filter that extracts user identity from Gateway-forwarded headers.
     * If X-User-Id header is present (set by the API Gateway after JWT validation),
     * we trust it and create the SecurityContext directly.
     */
    @Component
    @RequiredArgsConstructor
    static class GatewayHeaderAuthFilter extends OncePerRequestFilter {

        private final JwtTokenProvider jwtTokenProvider;

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {

            // Option 1: Trust Gateway-forwarded headers
            String userId = request.getHeader("X-User-Id");
            String userName = request.getHeader("X-User-Name");
            String userRoles = request.getHeader("X-User-Roles");
            String userEmail = request.getHeader("X-User-Email");

            if (StringUtils.hasText(userId) && StringUtils.hasText(userName)) {
                List<String> roles = userRoles != null ?
                        Arrays.asList(userRoles.split(",")) : List.of();

                UserPrincipal principal = UserPrincipal.builder()
                        .id(Long.parseLong(userId))
                        .username(userName)
                        .email(userEmail)
                        .enabled(true)
                        .roles(roles)
                        .build();

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);

            } else {
                // Option 2: Validate JWT directly (for direct service calls)
                String bearerToken = request.getHeader(SecurityConstants.HEADER_STRING);
                if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(SecurityConstants.TOKEN_PREFIX)) {
                    String token = bearerToken.substring(7);
                    if (jwtTokenProvider.validateToken(token)) {
                        String username = jwtTokenProvider.getUsernameFromToken(token);
                        Long uid = jwtTokenProvider.getUserIdFromToken(token);
                        List<String> roles = jwtTokenProvider.getRolesFromToken(token);

                        UserPrincipal principal = UserPrincipal.builder()
                                .id(uid).username(username).enabled(true).roles(roles).build();

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }

            filterChain.doFilter(request, response);
        }

        @Override
        protected boolean shouldNotFilter(HttpServletRequest request) {
            String path = request.getServletPath();
            return path.startsWith("/actuator") || path.startsWith("/v3/api-docs") || path.startsWith("/swagger-ui");
        }
    }
}
