package com.ptit.ecommerce.userservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String phone;
    private String address;
}
