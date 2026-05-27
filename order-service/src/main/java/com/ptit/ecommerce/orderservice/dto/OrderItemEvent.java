package com.ptit.ecommerce.orderservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemEvent {
    private Long productId;
    private Integer quantity;
}
