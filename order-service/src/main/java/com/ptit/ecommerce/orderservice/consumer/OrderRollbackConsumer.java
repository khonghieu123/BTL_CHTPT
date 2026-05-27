package com.ptit.ecommerce.orderservice.consumer;

import com.ptit.ecommerce.orderservice.config.RabbitMQConfig;
import com.ptit.ecommerce.orderservice.dto.OrderCreatedEvent;
import com.ptit.ecommerce.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderRollbackConsumer {

    private final OrderService orderService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_FAILED_QUEUE)
    public void consumeOrderFailedMessage(OrderCreatedEvent event) {
        log.info("[Saga Order Consumer] Nhận được sự kiện rollback lỗi đơn hàng từ RabbitMQ: {}", event);
        if (event == null || event.getOrderId() == null) {
            log.warn("[Saga Order Consumer] Sự kiện rollback không hợp lệ. Hủy bỏ.");
            return;
        }

        try {
            orderService.rollbackOrder(event.getOrderId());
        } catch (Exception e) {
            log.error("[Saga Order Consumer] Lỗi thực hiện giao dịch bù Saga cho đơn hàng ID: {}. Lỗi: {}", 
                    event.getOrderId(), e.getMessage());
        }
    }
}
