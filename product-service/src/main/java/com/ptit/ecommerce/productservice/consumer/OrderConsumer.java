package com.ptit.ecommerce.productservice.consumer;

import com.ptit.ecommerce.productservice.config.RabbitMQConfig;
import com.ptit.ecommerce.productservice.dto.OrderCreatedEvent;
import com.ptit.ecommerce.productservice.dto.OrderItemEvent;
import com.ptit.ecommerce.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderConsumer {

    private final ProductService productService;
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.PRODUCT_QUEUE)
    public void consumeOrderCreatedMessage(OrderCreatedEvent event) {
        log.info("[Product Order Consumer] Nhận được sự kiện tạo đơn hàng từ RabbitMQ: {}", event);
        if (event == null || event.getItems() == null || event.getItems().isEmpty()) {
            log.warn("[Product Order Consumer] Sự kiện tạo đơn hàng rỗng hoặc không hợp lệ. Bỏ qua.");
            return;
        }

        try {
            log.info("[Product Order Consumer] Đang xử lý cập nhật kho cho đơn hàng ID: {}", event.getOrderId());
            for (OrderItemEvent item : event.getItems()) {
                if (item.getProductId() != null && item.getQuantity() != null) {
                    productService.deductInventory(item.getProductId(), item.getQuantity());
                } else {
                    log.warn("[Product Order Consumer] Sản phẩm không hợp lệ trong sự kiện: {}", item);
                }
            }
            log.info("[Product Order Consumer] Đã cập nhật kho thành công cho đơn hàng ID: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("[Product Order Consumer] Cập nhật kho thất bại cho đơn hàng ID: {}. Bắt đầu Kích hoạt SAGA Rollback! Lỗi: {}", 
                    event.getOrderId(), e.getMessage());
            
            try {
                event.setStatus("CANCELLED");
                rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ORDER_EXCHANGE,
                    "order.failed",
                    event
                );
                log.info("[Product Order Consumer] Đã phát thành công sự kiện bù trừ SAGA cho đơn hàng ID: {} với Routing Key 'order.failed'", event.getOrderId());
            } catch (Exception ex) {
                log.error("[Product Order Consumer] Phát sự kiện bù trừ Saga thất bại cho đơn hàng ID: {}. Lỗi: {}", event.getOrderId(), ex.getMessage());
            }
        }
    }
}
