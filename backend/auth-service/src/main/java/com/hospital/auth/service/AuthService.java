package com.hospital.auth.service;

import com.hospital.auth.dto.*;
import com.hospital.auth.entity.RefreshToken;
import com.hospital.auth.entity.Role;
import com.hospital.auth.entity.User;
import com.hospital.auth.repository.UserRepository;
import com.hospital.common.dto.PagedResponse;
import com.hospital.common.event.AuditEvent;
import com.hospital.common.exception.BusinessException;
import com.hospital.common.exception.ResourceNotFoundException;
import com.hospital.common.exception.UnauthorizedException;
import com.hospital.common.security.JwtTokenProvider;
import com.hospital.common.security.SecurityConstants;
import com.hospital.common.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Core authentication and user management service.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final RabbitTemplate rabbitTemplate;

    /**
     * Authenticate user and return JWT tokens.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        // Check account lock
        if (user.isAccountLocked()) {
            if (user.isLockExpired()) {
                user.resetFailedAttempts();
                userRepository.save(user);
            } else {
                throw new UnauthorizedException(
                        "Account is locked due to multiple failed login attempts. Try again after 30 minutes.");
            }
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            request.getPassword()
                    )
            );

            // Reset failed attempts on successful login
            if (user.getFailedLoginAttempts() > 0) {
                user.resetFailedAttempts();
                userRepository.save(user);
            }

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            String accessToken = jwtTokenProvider.generateAccessToken(principal);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

            // Publish audit event
            publishAuditEvent(user, "LOGIN", "User logged in successfully");

            log.info("User '{}' logged in successfully", user.getUsername());

            return AuthResponse.of(accessToken, refreshToken.getToken(), toUserDto(user));

        } catch (BadCredentialsException e) {
            user.incrementFailedAttempts();
            userRepository.save(user);
            log.warn("Failed login attempt for user '{}'. Attempts: {}",
                    user.getUsername(), user.getFailedLoginAttempts());
            throw e;
        }
    }

    /**
     * Register a new user.
     */
    @Transactional
    public UserDto register(RegisterRequest request) {
        // Check for existing username/email
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("USERNAME_EXISTS", "Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("EMAIL_EXISTS", "Email is already registered");
        }

        // Default to PATIENT role if none specified
        Set<Role> roles = request.getRoles();
        if (roles == null || roles.isEmpty()) {
            roles = Set.of(Role.PATIENT);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .enabled(true)
                .roles(new java.util.HashSet<>(roles))
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered: {} with roles: {}", savedUser.getUsername(), roles);

        publishAuditEvent(savedUser, "REGISTER", "New user registered");

        return toUserDto(savedUser);
    }

    /**
     * Refresh the access token using a valid refresh token.
     */
    @Transactional
    public AuthResponse refreshToken(TokenRefreshRequest request) {
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(request.getRefreshToken());
        User user = refreshToken.getUser();

        UserPrincipal principal = buildUserPrincipal(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(principal);

        // Token rotation: create new refresh token
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .build();
    }

    /**
     * Logout: revoke all refresh tokens for the user.
     */
    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        refreshTokenService.revokeAllUserTokens(user);
        publishAuditEvent(user, "LOGOUT", "User logged out");
        log.info("User '{}' logged out", user.getUsername());
    }

    /**
     * Change password.
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("INVALID_PASSWORD", "Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Revoke all refresh tokens on password change
        refreshTokenService.revokeAllUserTokens(user);

        publishAuditEvent(user, "CHANGE_PASSWORD", "Password changed");
        log.info("Password changed for user: {}", user.getUsername());
    }

    /**
     * Get user by ID.
     */
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toUserDto(user);
    }

    /**
     * Get all users with pagination and optional search.
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getAllUsers(int page, int size, String search, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Page<User> userPage;

        if (search != null && !search.isBlank()) {
            userPage = userRepository.searchUsers(search, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserDto> users = userPage.getContent().stream()
                .map(this::toUserDto)
                .toList();

        return PagedResponse.of(
                users,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isFirst(),
                userPage.isLast()
        );
    }

    /**
     * Update user roles (admin only).
     */
    @Transactional
    public UserDto updateUserRoles(Long userId, Set<Role> roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setRoles(new java.util.HashSet<>(roles));
        User savedUser = userRepository.save(user);

        publishAuditEvent(savedUser, "UPDATE_ROLES",
                "Roles updated to: " + roles.stream().map(Enum::name).collect(Collectors.joining(",")));

        return toUserDto(savedUser);
    }

    /**
     * Enable/disable a user account.
     */
    @Transactional
    public UserDto toggleUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setEnabled(enabled);
        User savedUser = userRepository.save(user);

        String action = enabled ? "ENABLE_USER" : "DISABLE_USER";
        publishAuditEvent(savedUser, action, "User account " + (enabled ? "enabled" : "disabled"));

        return toUserDto(savedUser);
    }

    // ==================== Helpers ====================

    private UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .enabled(user.isEnabled())
                .roles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private UserPrincipal buildUserPrincipal(User user) {
        return UserPrincipal.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .enabled(user.isEnabled())
                .roles(user.getRoles().stream()
                        .map(role -> "ROLE_" + role.name())
                        .collect(Collectors.toList()))
                .build();
    }

    private void publishAuditEvent(User user, String action, String description) {
        try {
            AuditEvent event = AuditEvent.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .action(action)
                    .entityType("USER")
                    .entityId(user.getId())
                    .serviceName("auth-service")
                    .description(description)
                    .severity(AuditEvent.AuditSeverity.INFO)
                    .timestamp(LocalDateTime.now())
                    .build();
            rabbitTemplate.convertAndSend(
                    SecurityConstants.EXCHANGE_HOSPITAL,
                    SecurityConstants.ROUTING_KEY_AUDIT,
                    event
            );
        } catch (Exception ex) {
            log.error("Failed to publish audit event: {}", ex.getMessage());
        }
    }
}
