package com.ptit.ecommerce.orderservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    private Long userId;
    private List<OrderItemRequest> items;
}
