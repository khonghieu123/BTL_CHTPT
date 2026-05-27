package com.ptit.ecommerce.orderservice.service;

import com.ptit.ecommerce.orderservice.config.RabbitMQConfig;
import com.ptit.ecommerce.orderservice.dto.OrderCreatedEvent;
import com.ptit.ecommerce.orderservice.dto.OrderItemEvent;
import com.ptit.ecommerce.orderservice.dto.OrderRequest;
import com.ptit.ecommerce.orderservice.dto.OrderItemRequest;
import com.ptit.ecommerce.orderservice.dto.ProductResponse;
import com.ptit.ecommerce.orderservice.model.Order;
import com.ptit.ecommerce.orderservice.model.OrderItem;
import com.ptit.ecommerce.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;
    private final RestTemplate restTemplate;

    @Value("${product.service.url:http://localhost:8082}")
    private String productServiceUrl;

    public List<Order> getOrdersByUserId(Long userId) {
        log.info("[Order Service] Truy xuất lịch sử đơn hàng cho user ID: {}", userId);
        return orderRepository.findByUserId(userId);
    }

    @Transactional
    public Order createOrder(OrderRequest request, Long authenticatedUserId) {
        log.info("[Order Service] Bắt đầu tạo đơn hàng. User ID đã xác thực: {}", authenticatedUserId);
        
        Long userId = authenticatedUserId != null ? authenticatedUserId : request.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required to place an order.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item.");
        }

        // 1. Synchronous stock check against product-service via REST
        log.info("[Order Service] Đang kiểm tra kho cho các sản phẩm qua cuộc gọi REST đồng bộ tới: {}", productServiceUrl);
        for (OrderItemRequest itemReq : request.getItems()) {
            String url = productServiceUrl + "/api/v1/products/" + itemReq.getProductId();
            try {
                ProductResponse product = restTemplate.getForObject(url, ProductResponse.class);
                if (product == null) {
                    throw new RuntimeException("Product not found with ID: " + itemReq.getProductId());
                }
                log.info("[Order Service] Sản phẩm đã xác minh: {}, Kho hiện có: {}, Số lượng yêu cầu: {}", 
                        product.getName(), product.getStockQuantity(), itemReq.getQuantity());
                
                if (product.getStockQuantity() < itemReq.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product '" + product.getName() + 
                            "'. Available: " + product.getStockQuantity() + ", Requested: " + itemReq.getQuantity());
                }
            } catch (HttpClientErrorException.NotFound e) {
                log.error("[Order Service] Không tìm thấy sản phẩm có ID {} trong product-service", itemReq.getProductId());
                throw new RuntimeException("Product not found with ID: " + itemReq.getProductId());
            } catch (Exception e) {
                log.error("[Order Service] Lỗi giao tiếp với product-service cho sản phẩm ID {}: {}", itemReq.getProductId(), e.getMessage());
                throw new RuntimeException("Failed to verify stock: " + e.getMessage());
            }
        }

        // 2. Ghi nhận đơn hàng ở trạng thái PENDING
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .userId(userId)
                .status("PENDING")
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (OrderItemRequest itemReq : request.getItems()) {
            BigDecimal itemTotal = itemReq.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .productId(itemReq.getProductId())
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .order(order)
                    .build();

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        // Save order to DB
        Order savedOrder = orderRepository.save(order);
        log.info("[Order Service] Lưu đơn hàng thành công với ID: {} ở trạng thái PENDING", savedOrder.getId());

        // 3. Publish OrderCreatedEvent to RabbitMQ
        publishOrderCreatedEvent(savedOrder);

        return savedOrder;
    }

    private void publishOrderCreatedEvent(Order order) {
        List<OrderItemEvent> itemEvents = order.getItems().stream()
                .map(item -> OrderItemEvent.builder()
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .items(itemEvents)
                .build();

        log.info("[Order Service] Đang phát sự kiện OrderCreatedEvent lên Exchange: {} với Routing Key: {}. Sự kiện: {}", 
                RabbitMQConfig.ORDER_EXCHANGE, RabbitMQConfig.ORDER_CREATED_ROUTING_KEY, event);

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDER_EXCHANGE,
                RabbitMQConfig.ORDER_CREATED_ROUTING_KEY,
                event
        );
        log.info("[Order Service] Sự kiện OrderCreatedEvent đã được phát thành công.");
    }

    @Transactional
    public void rollbackOrder(Long orderId) {
        log.info("[Order Service] GIAO DỊCH BÙ SAGA (Compensating Transaction): Đang hoàn tác đơn hàng ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElse(null);
        if (order != null) {
            if ("PENDING".equals(order.getStatus())) {
                order.setStatus("CANCELLED");
                orderRepository.save(order);
                log.info("[Order Service] Đã cập nhật thành công đơn hàng ID: {} từ PENDING sang CANCELLED", orderId);
            } else {
                log.warn("[Order Service] Đơn hàng ID: {} đang ở trạng thái {} và không thể hoàn tác sang CANCELLED.", orderId, order.getStatus());
            }
        } else {
            log.error("[Order Service] Hoàn tác Saga thất bại: Không tìm thấy đơn hàng ID: {} trong cơ sở dữ liệu", orderId);
        }
    }

    public Order getOrderById(Long id) {
        log.info("[Order Service] Truy xuất chi tiết đơn hàng ID: {}", id);
        return orderRepository.findById(id).orElse(null);
    }

    public List<Order> getAllOrders() {
        log.info("[Order Service] Admin truy xuất danh sách toàn bộ đơn hàng trong hệ thống");
        return orderRepository.findAll();
    }


    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        log.info("[Order Service] Admin cập nhật trạng thái đơn hàng ID: {} sang {}", orderId, status);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
        order.setStatus(status.toUpperCase());
        Order saved = orderRepository.save(order);

        // Publish Order Status Update Event to notify the customer!
        try {
            OrderCreatedEvent event = OrderCreatedEvent.builder()
                    .orderId(saved.getId())
                    .userId(saved.getUserId())
                    .status(saved.getStatus())
                    .items(new ArrayList<>())
                    .build();

            if ("SUCCESS".equalsIgnoreCase(status)) {
                log.info("[Order Service] Đang phát sự kiện Order Success lên Exchange: {}", RabbitMQConfig.ORDER_EXCHANGE);
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.ORDER_EXCHANGE,
                        "order.created",
                        event
                );
            } else if ("FAILED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status)) {
                log.info("[Order Service] Đang phát sự kiện Order Failed lên Exchange: {}", RabbitMQConfig.ORDER_EXCHANGE);
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.ORDER_EXCHANGE,
                        "order.failed",
                        event
                );
            }
        } catch (Exception e) {
            log.error("[Order Service] Lỗi khi phát sự kiện cập nhật trạng thái lên RabbitMQ", e);
        }

        return saved;
    }
}
