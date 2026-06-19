package com.hospital.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Refresh token entity for JWT token rotation.
 * Stored in the database and validated during token refresh.
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_token", columnList = "token"),
        @Index(name = "idx_refresh_token_user", columnList = "user_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean revoked = false;

    public boolean isExpired() {
        return Instant.now().isAfter(expiryDate);
    }
}
