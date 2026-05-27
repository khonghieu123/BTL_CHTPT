package com.ptit.ecommerce.apigateway.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserValidationResponse {
    private boolean valid;
    private Long userId;
    private String username;
    private String role;
}
