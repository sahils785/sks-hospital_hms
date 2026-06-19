package com.hospital.common.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT token creation and validation utility.
 * Generates access tokens with user claims (userId, roles).
 * Used by Auth Service (token creation) and all services (token validation).
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.access-token-expiration:900000}") long accessTokenExpiration) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        this.accessTokenExpiration = accessTokenExpiration;
    }

    /**
     * Generate JWT access token from authentication object.
     */
    public String generateAccessToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateAccessToken(userPrincipal);
    }

    /**
     * Generate JWT access token from UserPrincipal.
     */
    public String generateAccessToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim(SecurityConstants.USER_ID_KEY, userPrincipal.getId())
                .claim(SecurityConstants.AUTHORITIES_KEY, roles)
                .claim("email", userPrincipal.getEmail())
                .claim("name", userPrincipal.getFullName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Extract username from JWT token.
     */
    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extract user ID from JWT token.
     */
    public Long getUserIdFromToken(String token) {
        return getClaims(token).get(SecurityConstants.USER_ID_KEY, Long.class);
    }

    /**
     * Extract roles from JWT token.
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return getClaims(token).get(SecurityConstants.AUTHORITIES_KEY, List.class);
    }

    /**
     * Validate JWT token.
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * Check if token is expired.
     */
    public boolean isTokenExpired(String token) {
        try {
            return getClaims(token).getExpiration().before(new Date());
        } catch (ExpiredJwtException ex) {
            return true;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
