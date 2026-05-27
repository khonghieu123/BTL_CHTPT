package com.ptit.ecommerce.productservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Product product;

    private String capacity;
    
    private String color;

    @Column(name = "price_offset", nullable = false)
    private BigDecimal priceOffset;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;
}
