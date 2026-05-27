package com.ptit.ecommerce.orderservice.controller;

import com.ptit.ecommerce.orderservice.dto.OrderRequest;
import com.ptit.ecommerce.orderservice.model.Order;
import com.ptit.ecommerce.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        
        log.info("[Order Controller] Nhận yêu cầu tạo đơn hàng. X-User-Id header: {}", xUserId);
        
        Long authenticatedUserId = null;
        if (xUserId != null && !xUserId.trim().isEmpty()) {
            try {
                authenticatedUserId = Long.valueOf(xUserId.trim());
            } catch (NumberFormatException e) {
                log.warn("[Order Controller] Giá trị X-User-Id header không hợp lệ: {}", xUserId);
            }
        }

        try {
            Order createdOrder = orderService.createOrder(request, authenticatedUserId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (IllegalArgumentException e) {
            log.error("[Order Controller] Yêu cầu tạo đơn hàng không hợp lệ: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            log.error("[Order Controller] Lỗi nghiệp vụ khi tạo đơn hàng: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("[Order Controller] Lỗi không xác định khi tạo đơn hàng", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrderHistoryByUserId(@PathVariable Long userId) {
        log.info("[Order Controller] Nhận yêu cầu truy xuất lịch sử đơn hàng của user ID: {}", userId);
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    public ResponseEntity<?> getMyOrderHistoryRoot(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        return getMyOrderHistory(xUserId);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrderHistory(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        log.info("[Order Controller] Nhận yêu cầu truy xuất lịch sử đơn hàng cá nhân. X-User-Id header: {}", xUserId);
        
        if (xUserId == null || xUserId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated. Missing X-User-Id header.");
        }

        try {
            Long userId = Long.valueOf(xUserId.trim());
            List<Order> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (NumberFormatException e) {
            log.warn("[Order Controller] Giá trị X-User-Id header không hợp lệ: {}", xUserId);
            return ResponseEntity.badRequest().body("Invalid X-User-Id header format.");
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<List<Order>> getAllOrdersAdmin() {
        return getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        log.info("[Order Controller] Lấy chi tiết đơn hàng ID: {}", id);
        try {
            Order order = orderService.getOrderById(id);
            if (order == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("[Order Controller] Lỗi khi lấy chi tiết đơn hàng ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        log.info("[Order Controller] Admin lấy toàn bộ danh sách đơn hàng.");
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id, 
            @RequestParam(value = "status", required = false) String statusParam,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        
        String status = statusParam;
        if (status == null && body != null) {
            status = body.get("status");
        }
        
        log.info("[Order Controller] Admin cập nhật trạng thái đơn hàng ID: {} sang {}", id, status);
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Trạng thái status không được để trống (thiếu request param hoặc JSON body)");
        }
        
        try {
            Order updated = orderService.updateOrderStatus(id, status.trim());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
