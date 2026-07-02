package com.lms.userservice.controller;

import com.lms.userservice.dto.ChangePasswordRequest;
import com.lms.userservice.dto.UpdateProfileRequest;
import com.lms.userservice.dto.UpdateRolesRequest;
import com.lms.userservice.dto.UserProfileResponse;
import com.lms.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileResponse getProfile(@AuthenticationPrincipal UserDetails principal) {
        return userService.getProfile(principal.getUsername());
    }

    @PutMapping("/me")
    public UserProfileResponse updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(principal.getUsername(), request);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getUsername(), request);
        return ResponseEntity.noContent().build();
    }


    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public Page<UserProfileResponse> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return userService.listUsers(search, role, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public UserProfileResponse getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public UserProfileResponse updateRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRolesRequest request) {
        return userService.updateRoles(id, request);
    }

    @PutMapping("/{id}/toggle-enabled")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public UserProfileResponse toggleEnabled(@PathVariable Long id) {
        return userService.toggleEnabled(id);
    }
}