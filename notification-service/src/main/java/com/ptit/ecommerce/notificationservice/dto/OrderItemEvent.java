package com.ptit.ecommerce.notificationservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemEvent {
    private Long productId;
    private Integer quantity;
}
