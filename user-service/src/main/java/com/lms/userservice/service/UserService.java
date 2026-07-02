package com.lms.userservice.service;

import com.lms.userservice.dto.ChangePasswordRequest;
import com.lms.userservice.dto.UpdateProfileRequest;
import com.lms.userservice.dto.UpdateRolesRequest;
import com.lms.userservice.dto.UserProfileResponse;
import com.lms.userservice.entity.Role;
import com.lms.userservice.entity.User;
import com.lms.userservice.repository.RoleRepository;
import com.lms.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    

    public Page<UserProfileResponse> listUsers(String search, String role, Pageable pageable) {
        String s = (search == null || search.isBlank()) ? "" : search.trim();
        String r = (role   == null || role.isBlank())   ? "" : role.trim();
        return userRepository.searchUsers(s, r, pageable).map(this::toResponse);
    }

    public UserProfileResponse getUserById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public UserProfileResponse updateRoles(Long id, UpdateRolesRequest req) {
        User user = findById(id);
        Set<Role> roles = new HashSet<>();
        for (String roleName : req.roles()) {
            roles.add(roleRepository.findByName(roleName)
                    .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + roleName)));
        }
        user.setRoles(roles);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse toggleEnabled(Long id) {
        User user = findById(id);
        user.setEnabled(!user.isEnabled());
        return toResponse(userRepository.save(user));
    }


    public UserProfileResponse getProfile(String username) {
        User user = findByUsername(username);
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest req) {
        User user = findByUsername(username);

        if (req.firstName() != null) user.setFirstName(req.firstName());
        if (req.lastName()  != null) user.setLastName(req.lastName());
        if (req.email() != null && !req.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.email()))
                throw new IllegalArgumentException("Email already in use");
            user.setEmail(req.email());
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest req) {
        User user = findByUsername(username);

        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash()))
            throw new IllegalArgumentException("Current password is incorrect");

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}