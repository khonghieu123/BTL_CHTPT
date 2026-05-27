package com.ptit.ecommerce.productservice.controller;

import com.ptit.ecommerce.productservice.model.Product;
import com.ptit.ecommerce.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        log.info("[Product Controller] Nhận yêu cầu lấy danh sách toàn bộ sản phẩm");
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        log.info("[Product Controller] Nhận yêu cầu lấy chi tiết sản phẩm ID: {}", id);
        try {
            Product product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            log.error("[Product Controller] Không tìm thấy sản phẩm với ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        log.info("[Product Controller] Admin yêu cầu thêm sản phẩm mới: {}", product.getName());
        try {
            Product created = productService.createProduct(product);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("[Product Controller] Lỗi khi tạo sản phẩm: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        log.info("[Product Controller] Admin yêu cầu cập nhật sản phẩm ID: {}", id);
        try {
            Product updated = productService.updateProduct(id, product);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("[Product Controller] Lỗi khi cập nhật sản phẩm ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("[Product Controller] Admin yêu cầu xóa sản phẩm ID: {}", id);
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("[Product Controller] Lỗi khi xóa sản phẩm ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
