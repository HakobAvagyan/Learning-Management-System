package com.lms.userservice.config;

import com.lms.userservice.entity.Role;
import com.lms.userservice.entity.User;
import com.lms.userservice.repository.RoleRepository;
import com.lms.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            log.info("Seed data already present, skipping.");
            return;
        }

        Role roleAdmin      = role("ROLE_ADMIN");
        Role roleInstructor = role("ROLE_INSTRUCTOR");
        Role roleStudent    = role("ROLE_STUDENT");

        String hash = passwordEncoder.encode("Password123!");

        save("admin1",      "admin1@lms.dev",       hash, "Александр", "Иванов",   Set.of(roleAdmin, roleStudent));

        save("instructor1", "instructor1@lms.dev",  hash, "Мария",     "Петрова",  Set.of(roleInstructor));
        save("instructor2", "instructor2@lms.dev",  hash, "Дмитрий",   "Соколов",  Set.of(roleInstructor));

        save("student1",    "student1@lms.dev",     hash, "Анна",      "Смирнова", Set.of(roleStudent));
        save("student2",    "student2@lms.dev",     hash, "Иван",      "Козлов",   Set.of(roleStudent));
        save("student3",    "student3@lms.dev",     hash, "Ольга",     "Новикова", Set.of(roleStudent));

        log.info("Seed users created: admin1, instructor1, instructor2, student1-3 (password: Password123!)");
    }

    private Role role(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new IllegalStateException("Role not found: " + name));
    }

    private void save(String username, String email, String hash,
                      String firstName, String lastName, Set<Role> roles) {
        userRepository.save(
                User.builder()
                        .username(username)
                        .email(email)
                        .passwordHash(hash)
                        .firstName(firstName)
                        .lastName(lastName)
                        .roles(roles)
                        .build()
        );
    }
}