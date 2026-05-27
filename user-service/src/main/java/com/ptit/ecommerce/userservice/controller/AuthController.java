package com.ptit.ecommerce.userservice.controller;

import com.ptit.ecommerce.userservice.dto.AuthResponse;
import com.ptit.ecommerce.userservice.dto.LoginRequest;
import com.ptit.ecommerce.userservice.dto.RegisterRequest;
import com.ptit.ecommerce.userservice.dto.UserValidationResponse;
import com.ptit.ecommerce.userservice.dto.ProfileUpdateRequest;
import com.ptit.ecommerce.userservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred during registration.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred during login.");
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<UserValidationResponse> validateToken(@RequestParam("token") String token) {
        UserValidationResponse response = authService.validateToken(token);
        if (response.isValid()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            java.util.List<com.ptit.ecommerce.userservice.model.User> users = authService.getAllUsers();
            java.util.List<com.ptit.ecommerce.userservice.dto.UserResponse> responses = users.stream()
                    .map(user -> com.ptit.ecommerce.userservice.dto.UserResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .role(user.getRole())
                            .fullName(user.getFullName() != null ? user.getFullName() : "")
                            .phone(user.getPhone() != null ? user.getPhone() : "")
                            .address(user.getAddress() != null ? user.getAddress() : "")
                            .status(user.getStatus())
                            .build())
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred fetching users.");
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            com.ptit.ecommerce.userservice.model.User user = authService.getUserById(id);
            com.ptit.ecommerce.userservice.dto.UserResponse response = com.ptit.ecommerce.userservice.dto.UserResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .fullName(user.getFullName() != null ? user.getFullName() : "")
                    .phone(user.getPhone() != null ? user.getPhone() : "")
                    .address(user.getAddress() != null ? user.getAddress() : "")
                    .status(user.getStatus())
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred fetching user details.");
        }
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody ProfileUpdateRequest request) {
        try {
            com.ptit.ecommerce.userservice.model.User user = authService.updateProfile(id, request);
            com.ptit.ecommerce.userservice.dto.UserResponse response = com.ptit.ecommerce.userservice.dto.UserResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .fullName(user.getFullName() != null ? user.getFullName() : "")
                    .phone(user.getPhone() != null ? user.getPhone() : "")
                    .address(user.getAddress() != null ? user.getAddress() : "")
                    .status(user.getStatus())
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred updating profile.");
        }
    }

    @PutMapping("/users")
    public ResponseEntity<?> updateUserAdmin(@RequestBody UserUpdateRequest request) {
        try {
            com.ptit.ecommerce.userservice.model.User user = authService.updateUserAdmin(request.getId(), request.getRole(), request.getStatus());
            com.ptit.ecommerce.userservice.dto.UserResponse response = com.ptit.ecommerce.userservice.dto.UserResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .fullName(user.getFullName() != null ? user.getFullName() : "")
                    .phone(user.getPhone() != null ? user.getPhone() : "")
                    .address(user.getAddress() != null ? user.getAddress() : "")
                    .status(user.getStatus())
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred updating user under admin permissions.");
        }
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class UserUpdateRequest {
        private Long id;
        private String role;
        private String status;
    }
}

