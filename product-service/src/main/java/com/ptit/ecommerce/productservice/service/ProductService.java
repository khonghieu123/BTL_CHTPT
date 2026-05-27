package com.ptit.ecommerce.productservice.service;

import com.ptit.ecommerce.productservice.model.Product;
import com.ptit.ecommerce.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Transactional
    public void deductInventory(Long productId, int quantity) {
        log.info("[Product Service] Đang trừ kho cho sản phẩm ID: {}, số lượng: {}", productId, quantity);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        if (product.getStockQuantity() < quantity) {
            log.warn("[Product Service] Không đủ tồn kho cho sản phẩm ID: {}. Hiện có: {}, Yêu cầu: {}.", 
                    productId, product.getStockQuantity(), quantity);
            throw new RuntimeException("Insufficient stock for product ID: " + productId + 
                    ". Available: " + product.getStockQuantity() + ", Requested: " + quantity);
        } else {
            product.setStockQuantity(product.getStockQuantity() - quantity);
        }

        productRepository.save(product);
        log.info("[Product Service] Cập nhật kho thành công. Tồn kho mới cho sản phẩm ID {} ({}) là: {}", 
                productId, product.getName(), product.getStockQuantity());
    }

    @Transactional
    public Product createProduct(Product product) {
        log.info("[Product Service] Đang thêm mới sản phẩm: {}", product.getName());
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product details) {
        log.info("[Product Service] Đang cập nhật sản phẩm ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(details.getName());
        product.setDescription(details.getDescription());
        product.setPrice(details.getPrice());
        product.setStockQuantity(details.getStockQuantity());
        product.setSku(details.getSku());
        product.setImageUrl(details.getImageUrl());

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("[Product Service] Đang xóa sản phẩm ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        productRepository.delete(product);
    }
}
