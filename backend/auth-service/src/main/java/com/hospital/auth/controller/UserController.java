package com.hospital.auth.controller;

import com.hospital.auth.dto.UserDto;
import com.hospital.auth.entity.Role;
import com.hospital.auth.service.AuthService;
import com.hospital.common.dto.ApiResponse;
import com.hospital.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

/**
 * User management endpoints (admin operations).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Admin user management operations")
public class UserController {

    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get All Users", description = "Get paginated list of users (admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        PagedResponse<UserDto> users = authService.getAllUsers(page, size, search, sortBy);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    @Operation(summary = "Get User by ID", description = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = authService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update User Roles", description = "Update roles for a user (admin only)")
    public ResponseEntity<ApiResponse<UserDto>> updateRoles(
            @PathVariable Long id,
            @RequestBody Set<Role> roles) {
        UserDto user = authService.updateUserRoles(id, roles);
        return ResponseEntity.ok(ApiResponse.success("Roles updated", user));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle User Status", description = "Enable or disable a user account (admin only)")
    public ResponseEntity<ApiResponse<UserDto>> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        UserDto user = authService.toggleUserStatus(id, enabled);
        return ResponseEntity.ok(ApiResponse.success(
                enabled ? "User enabled" : "User disabled", user));
    }
}
