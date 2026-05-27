package com.ptit.ecommerce.notificationservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreatedEvent {
    private Long orderId;
    private Long userId;
    private String status;
    private List<OrderItemEvent> items;
}
