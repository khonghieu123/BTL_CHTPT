package com.ptit.ecommerce.userservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role; // e.g., "ROLE_USER", "ROLE_ADMIN"

    @Column(nullable = false, defaultValue = "ACTIVE")
    @Builder.Default
    private String status = "ACTIVE"; // e.g., "ACTIVE", "SUSPENDED"

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;
}

