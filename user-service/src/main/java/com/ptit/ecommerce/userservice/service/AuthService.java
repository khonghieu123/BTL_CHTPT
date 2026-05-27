package com.ptit.ecommerce.userservice.service;

import com.ptit.ecommerce.userservice.dto.AuthResponse;
import com.ptit.ecommerce.userservice.dto.LoginRequest;
import com.ptit.ecommerce.userservice.dto.RegisterRequest;
import com.ptit.ecommerce.userservice.dto.UserValidationResponse;
import com.ptit.ecommerce.userservice.dto.ProfileUpdateRequest;
import com.ptit.ecommerce.userservice.model.User;
import com.ptit.ecommerce.userservice.repository.UserRepository;
import com.ptit.ecommerce.userservice.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role("ROLE_USER") // Default role for users
                .fullName("")
                .phone("")
                .address("")
                .build();

        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password!");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName() != null ? user.getFullName() : "")
                .phone(user.getPhone() != null ? user.getPhone() : "")
                .address(user.getAddress() != null ? user.getAddress() : "")
                .build();
    }

    public UserValidationResponse validateToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        boolean isValid = jwtUtils.validateToken(token);
        if (!isValid) {
            return UserValidationResponse.builder()
                    .valid(false)
                    .build();
        }

        try {
            return UserValidationResponse.builder()
                    .valid(true)
                    .userId(jwtUtils.extractUserId(token))
                    .username(jwtUtils.extractUsername(token))
                    .role(jwtUtils.extractRole(token))
                    .build();
        } catch (Exception e) {
            return UserValidationResponse.builder()
                    .valid(false)
                    .build();
        }
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        return userRepository.save(user);
    }

    public User updateUserAdmin(Long userId, String role, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (role != null) {
            // Support front-end sending simple role (ADMIN/CUSTOMER) or raw role (ROLE_ADMIN/ROLE_USER)
            if (role.equalsIgnoreCase("ADMIN")) {
                user.setRole("ROLE_ADMIN");
            } else if (role.equalsIgnoreCase("CUSTOMER")) {
                user.setRole("ROLE_USER");
            } else {
                user.setRole(role);
            }
        }
        if (status != null) {
            user.setStatus(status);
        }

        return userRepository.save(user);
    }
}

