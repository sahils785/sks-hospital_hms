package com.hospital.auth.service;

import com.hospital.auth.entity.RefreshToken;
import com.hospital.auth.entity.User;
import com.hospital.auth.repository.RefreshTokenRepository;
import com.hospital.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Manages refresh token lifecycle: creation, validation, rotation, and cleanup.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpiration;

    /**
     * Create a new refresh token for the user (token rotation).
     * Revokes all existing tokens for the user.
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Revoke existing tokens for this user
        refreshTokenRepository.revokeAllByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenExpiration))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Validate and return the refresh token entity.
     * Throws UnauthorizedException if invalid, expired, or revoked.
     */
    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        return refreshToken;
    }

    /**
     * Revoke all refresh tokens for a user (logout from all devices).
     */
    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUser(user);
        log.info("Revoked all refresh tokens for user: {}", user.getUsername());
    }

    /**
     * Cleanup expired tokens every hour.
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens();
        log.debug("Expired refresh tokens cleaned up");
    }
}
